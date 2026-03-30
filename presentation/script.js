// Slideshow navigation with step-reveal system
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
const currentSlideEl = document.getElementById('current-slide');
const totalSlidesEl = document.getElementById('total-slides');
let currentSlide = 0;
let currentSteps = [];
let currentStepIndex = 0;
let clickTimer = null;
const navNext = document.getElementById('nav-next');
const slideArcLabel = document.getElementById('slide-arc-label');
const DBLCLICK_DELAY = 250;

totalSlidesEl.textContent = totalSlides;

// ---- Step initialization ----
// Auto-detect and tag steppable elements within each slide
function initSteps() {
    slides.forEach(function (slide) {
        var content = slide.querySelector('.slide-content');
        if (!content) return;

        // Skip title slides — they appear fully
        if (slide.classList.contains('title-slide')) return;

        var skipClasses = ['subtitle', 'sub-heading', 'visual-caption'];

        // Top-level list items (direct or inside layout containers)
        content.querySelectorAll(':scope > ul > li, :scope > ul > li > ul > li, :scope > .background-text > ul > li, :scope > .arc-overview-text > ul > li, :scope > .sandwich-columns > .background-text > ul > li, :scope > .background-layout > .background-text > ul > li, :scope > .header-photo-right > ul > li').forEach(function (el) {
            if (!el.classList.contains('step-paired')) {
                el.classList.add('step');
            }
        });

        // Quote blocks
        content.querySelectorAll(':scope > .quote-block, :scope > .quote-with-portrait').forEach(function (el) {
            el.classList.add('step');
        });

        // Flow items and arrows
        content.querySelectorAll('.flow-item, .flow-arrow').forEach(function (el) {
            el.classList.add('step');
        });

        // SVG containers (direct children only, not inside .triangle-layout)
        content.querySelectorAll(':scope > .svg-container').forEach(function (el) {
            el.classList.add('step');
        });

        // Image placeholders
        content.querySelectorAll(':scope > .image-placeholder').forEach(function (el) {
            el.classList.add('step');
        });

        // Bottom paragraphs (narrative, emphasis, etc.) — not subtitles
        content.querySelectorAll(':scope > p, :scope > .background-layout > .background-text > p').forEach(function (el) {
            var dominated = skipClasses.some(function (c) { return el.classList.contains(c); });
            if (!dominated && !el.classList.contains('step-paired')) {
                el.classList.add('step');
            }
        });

        // Flow results
        content.querySelectorAll('.flow-result').forEach(function (el) {
            el.classList.add('step');
        });

        // Column cards
        content.querySelectorAll('.column-card').forEach(function (el) {
            el.classList.add('step');
        });

        // CTA blocks
        content.querySelectorAll('.cta-block').forEach(function (el) {
            el.classList.add('step');
        });

        // Recap taglines
        content.querySelectorAll('.tagline').forEach(function (el) {
            el.classList.add('step');
        });
    });
}

// ---- Slide navigation ----
function getSlideFromHash() {
    var match = location.hash.match(/^#slide-(\d+)$/);
    if (match) {
        var n = parseInt(match[1], 10) - 1;
        if (n >= 0 && n < totalSlides) return n;
    }
    return 0;
}

function showSlide(index, revealAll) {
    stopGifCycle();
    slides.forEach(function (s) { s.classList.remove('active'); });

    if (index >= totalSlides) currentSlide = 0;
    else if (index < 0) currentSlide = totalSlides - 1;
    else currentSlide = index;

    var slide = slides[currentSlide];
    currentSlideEl.textContent = currentSlide + 1;

    // Gather steps BEFORE activating the slide
    currentSteps = Array.from(slide.querySelectorAll('.step'));
    var pairedEls = Array.from(slide.querySelectorAll('.step-paired'));

    // Handle cross-out targets
    var crossOutTargets = [];
    currentSteps.forEach(function (s) {
        var id = s.getAttribute('data-cross-out');
        if (id) crossOutTargets.push(document.getElementById(id));
    });

    // Gather card elements for show/hide
    var cardEls = Array.from(slide.querySelectorAll('.stack-card'));

    if (revealAll) {
        currentSteps.forEach(function (s) { s.classList.add('step-visible'); });
        pairedEls.forEach(function (s) { s.classList.add('step-visible'); });
        crossOutTargets.forEach(function (el) { if (el) el.classList.add('crossed-out'); });
        cardEls.forEach(function (c) { c.classList.add('card-visible'); });
        currentStepIndex = currentSteps.length;
    } else {
        // Kill transitions so steps hide instantly (no 0.4s fade)
        var allAnimatable = currentSteps.concat(pairedEls);
        allAnimatable.forEach(function (s) { s.style.transition = 'none'; });
        cardEls.forEach(function (c) { c.style.transition = 'none'; });
        currentSteps.forEach(function (s) { s.classList.remove('step-visible'); });
        pairedEls.forEach(function (s) { s.classList.remove('step-visible'); });
        crossOutTargets.forEach(function (el) { if (el) el.classList.remove('crossed-out'); });
        cardEls.forEach(function (c) { c.classList.remove('card-visible'); });
        currentStepIndex = 0;
        // Force browser to apply the hidden state before we restore transitions
        void slide.offsetWidth;
        allAnimatable.forEach(function (s) { s.style.transition = ''; });
        cardEls.forEach(function (c) { c.style.transition = ''; });
    }

    // Progressive photo opacity
    var progressivePhoto = slide.querySelector('.progressive-photo');
    if (progressivePhoto) {
        if (revealAll) {
            progressivePhoto.style.opacity = '1';
        } else {
            progressivePhoto.style.transition = 'none';
            progressivePhoto.style.opacity = '0';
            void progressivePhoto.offsetWidth;
            progressivePhoto.style.transition = '';
        }
    }

    // Reset or apply hide-on-reveal headers
    var hideHeaders = Array.from(slide.querySelectorAll('.hide-on-reveal, .media-headline:not(.media-followup)'));
    if (revealAll) {
        hideHeaders.forEach(function (h) { h.classList.add('hidden'); });
    } else {
        hideHeaders.forEach(function (h) { h.classList.remove('hidden'); });
    }

    // Now activate the slide — steps are already in correct state
    slide.classList.add('active');

    if (revealAll && slide.querySelector('#ethos-gif')) startGifCycle();

    // Update arc label in header bar
    var arcHeader = slide.getAttribute('data-arc-header');
    if (arcHeader) {
        slideArcLabel.innerHTML = arcHeader;
        slideArcLabel.classList.add('visible');
    } else {
        slideArcLabel.classList.remove('visible');
    }

    history.replaceState(null, '', '#slide-' + (currentSlide + 1));
    updateNextReady();
}

function updateNextReady() {
    if (currentStepIndex >= currentSteps.length) {
        navNext.classList.add('ready');
    } else {
        navNext.classList.remove('ready');
    }
}


function revealNextStep() {
    if (currentStepIndex < currentSteps.length) {
        var step = currentSteps[currentStepIndex];
        step.classList.add('step-visible');
        // Reveal paired badge if this step has a data-badge attribute
        var badgeId = step.getAttribute('data-badge');
        if (badgeId) {
            var slide = slides[currentSlide];
            var paired = slide.querySelector('.step-paired[data-badge="' + badgeId + '"]');
            if (paired) paired.classList.add('step-visible');
        }
        // Cross out a target element when this step is revealed
        var crossOutId = step.getAttribute('data-cross-out');
        if (crossOutId) {
            var target = document.getElementById(crossOutId);
            if (target) target.classList.add('crossed-out');
        }
        // Start gif cycle if this step contains the ethos gif
        if (step.querySelector('#ethos-gif')) {
            startGifCycle();
        }
        // Show linked card image
        var cardId = step.getAttribute('data-show-card');
        if (cardId) {
            var card = document.getElementById(cardId);
            if (card) card.classList.add('card-visible');
        }
        // Hide header when step with data-hide-header is revealed
        if (step.hasAttribute('data-hide-header')) {
            var slide = slides[currentSlide];
            var header = slide.querySelector('.media-headline') || slide.querySelector('.hide-on-reveal');
            if (header) header.classList.add('hidden');
        }

        // Progressive photo — increase opacity with each step (excluding .slide-closing)
        var slide = slides[currentSlide];
        var progressivePhoto = slide.querySelector('.progressive-photo');
        if (progressivePhoto && !step.classList.contains('slide-closing')) {
            var bulletSteps = currentSteps.filter(function (s) {
                return !s.classList.contains('slide-closing');
            });
            var revealed = currentStepIndex + 1;
            var opacity = Math.min(revealed / bulletSteps.length, 1);
            progressivePhoto.style.opacity = opacity;
        }

        currentStepIndex++;
        updateNextReady();
        return true;
    }
    return false;
}

function advance() {
    if (!revealNextStep()) {
        nextSlide();
    }
}

function nextSlide() {
    showSlide(currentSlide + 1, false);
}

function previousSlide() {
    showSlide(currentSlide - 1, true);
}

// ---- Keyboard ----
document.addEventListener('keydown', function (e) {
    switch (e.key) {
        case 'ArrowRight':
        case ' ':
            e.preventDefault();
            advance();
            break;
        case 'ArrowLeft':
        case 'Backspace':
            e.preventDefault();
            previousSlide();
            break;
        case 'Home':
            e.preventDefault();
            showSlide(0, false);
            break;
        case 'End':
            e.preventDefault();
            showSlide(totalSlides - 1, true);
            break;
    }
});

// ---- Mouse: single click = reveal step, double click = next slide ----
document.addEventListener('click', function (e) {
    if (e.button !== 0) return;
    if (e.target.closest('.nav-hints')) return;
    var sel = window.getSelection();
    if (sel && !sel.isCollapsed) return;

    if (clickTimer) {
        // Second click within threshold — double-click → next slide
        clearTimeout(clickTimer);
        clickTimer = null;
        nextSlide();
    } else {
        clickTimer = setTimeout(function () {
            clickTimer = null;
            // Single click — reveal next step (or advance if all shown)
            advance();
        }, DBLCLICK_DELAY);
    }
});

// Right-click back
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    previousSlide();
});

// ---- Nav buttons ----
document.getElementById('nav-prev').addEventListener('click', function (e) {
    e.stopPropagation();
    previousSlide();
});
document.getElementById('nav-next').addEventListener('click', function (e) {
    e.stopPropagation();
    if (currentStepIndex < currentSteps.length) {
        // Reveal all remaining steps at once
        while (currentStepIndex < currentSteps.length) {
            revealNextStep();
        }
    } else {
        nextSlide();
    }
});

// ---- Touch swipe ----
var touchStartX = 0;
var touchStartY = 0;

document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', function (e) {
    var dx = touchStartX - e.changedTouches[0].screenX;
    var dy = touchStartY - e.changedTouches[0].screenY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) advance();
        else previousSlide();
    }
}, { passive: true });

// ---- Hash deep-linking ----
window.addEventListener('hashchange', function () {
    showSlide(getSlideFromHash(), true);
});

// ---- GIF (no controls — loops naturally) ----
function startGifCycle() {}
function stopGifCycle() {}

// ---- Initialize ----
initSteps();
showSlide(getSlideFromHash(), false);
