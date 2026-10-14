(() => {
    'use strict';
    const $ = selector => document.querySelector(selector);
    const $$ = selector => [...document.querySelectorAll(selector)];
    const header = $('.site-header');
    const menu = $('.menu-toggle');
    const nav = $('#site-navigation');
    const wide = matchMedia('(min-width: 900px)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const links = $$('nav a[href^="#"]');
    const navSections = links.map(link => $(link.hash));
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const smooth = value => value * value * (3 - 2 * value);
    const lerp = (start, end, progress) => start + (end - start) * progress;
    const set = (element, property, value) => element.style.setProperty(property, value);

    header.classList.add('nav-enhanced');
    menu.hidden = false;
    function closeMenu() { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
    menu.addEventListener('click', () => {
        const open = menu.getAttribute('aria-expanded') !== 'true';
        menu.setAttribute('aria-expanded', String(open));
        nav.classList.toggle('is-open', open);
    });
    links.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
    });
    document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
    header.addEventListener('focusout', event => { if (!header.contains(event.relatedTarget)) closeMenu(); });
    wide.addEventListener('change', closeMenu);

    const scenes = {
        story: { section: $('#about'), stage: $('.about-stage'), window: $('.story-window'), track: $('.about-track'), items: [$('.about-visual'), $('.about-content')], controls: $('.story-controls'), capability: 'story-capable', active: 0 },
        services: { section: $('#services'), stage: $('.services-layout'), window: $('.service-window'), track: $('.service-stack'), items: $$('.service-card'), controls: $('.service-controls'), capability: 'gallery-capable', active: 0 },
        approach: { section: $('#why-us'), stage: $('.why-stage'), window: $('.why-canvas'), track: $('.why-grid'), items: $$('.why-card'), controls: $('.approach-controls'), capability: 'approach-capable', active: 0 }
    };
    const journey = $('.clarity-journey');
    const journeyStage = $('.journey-stage');
    const orbit = $('.clarity-orbit');
    const orbitTiles = $$('[data-orbit]');
    const photos = $$('[data-parallax]');
    const heroVisual = $('.hero-visual');
    const heroSeal = $('.hero-seal');
    const heroCaption = $('.photo-note');
    const ribbon = $('.word-ribbon');
    const contactDetails = $('.contact-details');
    const contactSection = $('#contact');
    const contacts = $$('.contact-item');
    const reveals = $$('[data-reveal]');
    const titles = $$('[data-title-motion]');
    const depthLayers = $$('[data-depth]').map(element => ({ element, anchor: element.closest('section'), distance: Number(element.dataset.depth) }));
    const surfaces = $$('.service-card, .why-card, .contact-item');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    let revealObserver;
    let titleObserver;
    let framePending = false;
    let layoutPending = false;
    $('.footer').addEventListener('focusin', () => {
        if (!reduced.matches) scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
    });

    function observeReveals() {
        revealObserver?.disconnect();
        const enabled = !reduced.matches && 'IntersectionObserver' in window;
        document.body.classList.toggle('motion-enabled', enabled);
        if (!enabled) { reveals.forEach(element => element.classList.add('is-visible')); return; }
        revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
            });
        }, { threshold: .06 });
        reveals.forEach(element => revealObserver.observe(element));
    }

    // Preserve each heading's full accessible name while its visual words settle.
    // Word masks occupy their original space, so the reveal never reflows a scene.
    function prepareTitles() {
        titles.forEach(title => {
            title.setAttribute('aria-label', title.innerText.replace(/\s+/g, ' ').trim());
            const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
            const nodes = [];
            while (walker.nextNode()) nodes.push(walker.currentNode);
            let index = 0;
            nodes.forEach(node => {
                const fragment = document.createDocumentFragment();
                node.textContent.split(/(\s+)/).filter(Boolean).forEach(word => {
                    if (/^\s+$/.test(word)) { fragment.append(document.createTextNode(word)); return; }
                    const mask = document.createElement('span');
                    const inner = document.createElement('span');
                    mask.className = 'motion-word';
                    mask.setAttribute('aria-hidden', 'true');
                    set(mask, '--word-index', index++);
                    inner.className = 'motion-word-inner';
                    inner.textContent = word;
                    mask.append(inner);
                    fragment.append(mask);
                });
                node.replaceWith(fragment);
            });
            title.classList.add('title-prepared');
        });
    }

    function observeTitles() {
        titleObserver?.disconnect();
        if (reduced.matches || !('IntersectionObserver' in window)) {
            titles.forEach(title => title.classList.add('title-visible'));
            return;
        }
        titleObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('title-visible');
                    titleObserver.unobserve(entry.target);
                }
            });
        }, { threshold: .12 });
        titles.filter(title => !title.classList.contains('title-visible')).forEach(title => titleObserver.observe(title));
    }

    // Light responds to a mouse; touch and keyboard retain steady reading planes.
    let litSurface = null;
    let lightPoint;
    let lightPending = false;
    surfaces.forEach(surface => {
        surface.addEventListener('pointermove', event => {
            if (reduced.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
            litSurface = surface;
            lightPoint = { x: event.clientX, y: event.clientY };
            if (lightPending) return;
            lightPending = true;
            requestAnimationFrame(() => {
                lightPending = false;
                if (!litSurface) return;
                const rect = litSurface.getBoundingClientRect();
                set(litSurface, '--surface-x', `${(clamp((lightPoint.x - rect.left) / rect.width) * 100).toFixed(1)}%`);
                set(litSurface, '--surface-y', `${(clamp((lightPoint.y - rect.top) / rect.height) * 100).toFixed(1)}%`);
                litSurface.classList.add('surface-lit');
            });
        }, { passive: true });
        surface.addEventListener('pointerleave', () => {
            surface.classList.remove('surface-lit');
            if (litSurface === surface) litSurface = null;
        });
    });

    function updateControls(scene, index) {
        scene.active = clamp(index, 0, scene.items.length - 1);
        const counter = scene.controls.querySelector('.scene-count');
        const text = `${String(scene.active + 1).padStart(2, '0')} / ${String(scene.items.length).padStart(2, '0')}`;
        if (counter.textContent !== text) counter.textContent = text;
        scene.controls.querySelector('[data-step="-1"]').setAttribute('aria-disabled', String(scene.active === 0));
        scene.controls.querySelector('[data-step="1"]').setAttribute('aria-disabled', String(scene.active === scene.items.length - 1));
    }

    function configureLayout() {
        layoutPending = false;
        const available = innerHeight - header.offsetHeight;
        const motion = !reduced.matches;
        document.body.classList.add('gallery-ready', 'approach-ready');
        document.body.classList.toggle('story-ready', motion && !wide.matches);
        scenes.services.controls.hidden = false;
        scenes.approach.controls.hidden = false;
        // Measure actual reading content before reserving a sticky camera path.
        const storyHeight = Math.max(...scenes.story.items.map(item => item.offsetHeight)) + 44 + 18 + 56;
        const storyFits = motion && storyHeight <= available + 2;
        document.body.classList.toggle('story-capable', storyFits);
        scenes.story.controls.hidden = !(storyFits || document.body.classList.contains('story-ready'));
        const serviceStyle = getComputedStyle(scenes.services.stage);
        const serviceSpacing = parseFloat(serviceStyle.paddingTop) + parseFloat(serviceStyle.paddingBottom) + 2 * parseFloat(serviceStyle.rowGap);
        const serviceHeight = $('.services-heading').offsetHeight + scenes.services.window.offsetHeight + scenes.services.controls.offsetHeight + serviceSpacing;
        document.body.classList.toggle('gallery-capable', motion && serviceHeight <= available + 2);
        const principleHeight = Math.max(...scenes.approach.items.map(item => item.offsetHeight));
        set(scenes.approach.stage, '--principle-height', `${principleHeight}px`);
        const approachHeight = $('.why-intro').offsetHeight + principleHeight + 40 + scenes.approach.controls.offsetHeight + 68;
        document.body.classList.toggle('approach-capable', motion && approachHeight <= available + 2);
        document.body.classList.toggle('journey-capable', motion && journeyStage.offsetHeight <= available + 2);
        Object.values(scenes).forEach(scene => {
            const pinned = document.body.classList.contains(scene.capability);
            scene.controls.querySelector('.scene-hint').textContent = scene === scenes.story
                ? (pinned ? 'Scroll from perspective to purpose' : 'Swipe to read our story')
                : (pinned ? 'Scroll to explore' : 'Swipe or use the arrows');
            if (pinned) scene.window.scrollLeft = 0;
            else {
                const distance = scene.track.scrollWidth - scene.window.clientWidth;
                updateControls(scene, distance > 0 ? Math.round(scene.window.scrollLeft / distance * (scene.items.length - 1)) : 0);
            }
        });
        if (!motion) {
            positionOrbit(1, orbit.clientWidth);
            depthLayers.forEach(({ element }) => set(element, '--depth-y', '0px'));
            litSurface = null;
            surfaces.forEach(surface => surface.classList.remove('surface-lit'));
        }
        scheduleFrame();
    }
    function scheduleLayout() {
        if (!layoutPending) { layoutPending = true; requestAnimationFrame(configureLayout); }
    }

    function sceneProgress(scene, headerHeight) {
        return clamp((headerHeight - scene.section.getBoundingClientRect().top) / Math.max(scene.section.offsetHeight - scene.stage.offsetHeight, 1));
    }
    // Each panel settles before the next camera movement begins.
    function panelPosition(progress, count) {
        const position = progress * (count - 1);
        const whole = Math.floor(position);
        return Math.min(count - 1, whole + smooth(clamp((position - whole - .14) / .72)));
    }
    function selectPanel(scene, index, immediate = false) {
        index = clamp(index, 0, scene.items.length - 1);
        if (document.body.classList.contains(scene.capability)) {
            const top = scene.section.getBoundingClientRect().top + scrollY - header.offsetHeight;
            const travel = scene.section.offsetHeight - scene.stage.offsetHeight;
            scrollTo({ top: top + travel * index / (scene.items.length - 1), behavior: immediate || reduced.matches ? 'instant' : 'smooth' });
        } else if (scene === scenes.story && wide.matches) {
            scene.items[index].scrollIntoView({ block: 'center', behavior: reduced.matches ? 'instant' : 'smooth' });
        } else {
            const distance = Math.max(scene.track.scrollWidth - scene.window.clientWidth, 0);
            scene.window.scrollTo({ left: distance * index / (scene.items.length - 1), behavior: immediate || reduced.matches ? 'instant' : 'smooth' });
        }
        updateControls(scene, index);
    }
    $$('[data-scene]').forEach(button => button.addEventListener('click', () => {
        const scene = scenes[button.dataset.scene];
        selectPanel(scene, scene.active + Number(button.dataset.step));
    }));
    Object.values(scenes).forEach(scene => {
        scene.stage.addEventListener('keydown', event => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                selectPanel(scene, scene.active + (event.key === 'ArrowRight' ? 1 : -1));
            }
        });
        scene.window.addEventListener('scroll', () => {
            if (!document.body.classList.contains(scene.capability)) {
                const distance = scene.track.scrollWidth - scene.window.clientWidth;
                updateControls(scene, distance > 0 ? Math.round(scene.window.scrollLeft / distance * (scene.items.length - 1)) : 0);
            }
        }, { passive: true });
        scene.items.forEach((item, index) => item.addEventListener('focusin', () => selectPanel(scene, index, true)));
        updateControls(scene, 0);
    });

    function positionOrbit(progress, size) {
        const eased = smooth(progress);
        const scattered = [[-.28, -.25, -18], [.29, -.08, 16], [-.15, .30, -12]];
        orbitTiles.forEach((tile, index) => {
            const [x, y, turn] = scattered[index];
            const arc = Math.sin(progress * Math.PI) * (index === 1 ? -12 : 12);
            set(tile, '--tile-x', `${(lerp(x * size, (index - 1) * size * .32, eased) + arc).toFixed(2)}px`);
            set(tile, '--tile-y', `${lerp(y * size, size * .31, eased).toFixed(2)}px`);
            set(tile, '--tile-turn', `${lerp(turn, 0, eased).toFixed(2)}deg`);
        });
        set(orbit, '--orbit-turn', `${(progress * 80).toFixed(2)}deg`);
        set(orbit, '--core-y', `${(-16 * eased).toFixed(2)}px`);
        set(orbit, '--core-scale', (.92 + eased * .08).toFixed(3));
        set(journey, '--journey-progress', progress.toFixed(3));
    }

    function updateScroll() {
        framePending = false;
        const viewport = innerHeight;
        const headerHeight = header.offsetHeight;
        const range = document.documentElement.scrollHeight - viewport;
        let activeSection = null;
        navSections.forEach(section => { if (section.getBoundingClientRect().top <= headerHeight + 100) activeSection = section.id; });
        links.forEach(link => {
            if (link.hash === `#${activeSection}`) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
        });
        set(header, '--reading-progress', range > 0 ? clamp(scrollY / range) : 0);
        if (reduced.matches) return;

        // Read scene geometry first. The camera uses composited transforms.
        const photoStates = photos.map(photo => {
            const rect = photo.parentElement.getBoundingClientRect();
            const progress = clamp((viewport / 2 - rect.top - rect.height / 2) / viewport, -1, 1);
            return { offset: progress * Number(photo.dataset.parallax) * 1.6, progress };
        });
        const ribbonRect = ribbon.getBoundingClientRect();
        const ribbonProgress = clamp((viewport - ribbonRect.top) / (viewport + ribbonRect.height));
        const journeyRect = journey.getBoundingClientRect();
        const journeyProgress = document.body.classList.contains('journey-capable')
            ? clamp((headerHeight - journeyRect.top) / Math.max(journey.offsetHeight - journeyStage.offsetHeight, 1))
            : clamp((viewport * .85 - journeyRect.top) / (viewport * .7));
        const orbitSize = orbit.clientWidth;
        const sceneStates = Object.values(scenes).map(scene => {
            const pinned = document.body.classList.contains(scene.capability);
            const progress = pinned ? sceneProgress(scene, headerHeight) : 0;
            return { scene, pinned, progress, position: panelPosition(progress, scene.items.length), distance: Math.max(scene.track.scrollWidth - scene.window.clientWidth, 0), width: scene.window.clientWidth };
        });
        const contactRect = contactDetails.getBoundingClientRect();
        const contactFan = 1 - smooth(clamp((viewport - contactSection.getBoundingClientRect().top) / (viewport * .55)));
        const contactOffsets = contacts.map(card => {
            const centre = contactRect.top + card.offsetTop + card.offsetHeight / 2;
            // Keep the text plane flat; depth is carried by framing and a small lift.
            return clamp((viewport * .6 - centre) / viewport, -.8, .8) * -8;
        });
        const servicePositions = scenes.services.items.map(card => ({ centre: card.offsetLeft + card.offsetWidth / 2 }));
        const depthOffsets = depthLayers.map(({ anchor, distance }) => {
            const rect = anchor.getBoundingClientRect();
            return (clamp((viewport - rect.top) / (viewport + rect.height)) - .5) * distance * 2;
        });

        photos.forEach((photo, index) => {
            set(photo, '--parallax-y', `${photoStates[index].offset.toFixed(2)}px`);
            set(photo, '--photo-scale', (1.14 + Math.abs(photoStates[index].progress) * .025).toFixed(3));
        });
        set(heroVisual, '--hero-turn', `${(photoStates[0].progress * 3).toFixed(2)}deg`);
        set(heroSeal, '--seal-y', `${(photoStates[0].progress * -32).toFixed(2)}px`);
        set(heroCaption, '--caption-y', `${(photoStates[0].progress * 24).toFixed(2)}px`);
        set(ribbon, '--ribbon-x', `${(-240 * ribbonProgress).toFixed(2)}px`);
        set(ribbon, '--ribbon-echo-x', `${(-180 + 180 * ribbonProgress).toFixed(2)}px`);
        depthLayers.forEach(({ element }, index) => set(element, '--depth-y', `${depthOffsets[index].toFixed(2)}px`));
        contacts.forEach((card, index) => {
            set(card, '--contact-y', `${contactOffsets[index].toFixed(2)}px`);
            set(card, '--contact-x', `${((index - 1) * 24 * contactFan).toFixed(2)}px`);
            set(card, '--contact-fan', `${((index - 1) * -14 * contactFan).toFixed(2)}deg`);
        });
        positionOrbit(journeyProgress, orbitSize);

        sceneStates.forEach(({ scene, pinned, progress, position, distance, width }) => {
            if (!pinned) return;
            updateControls(scene, Math.round(position));
            set(scene.section, '--scene-progress', progress.toFixed(3));
            if (scene === scenes.story) {
                const move = smooth(clamp((progress - .10) / .62));
                set(scene.track, '--story-camera-x', `${(-width * move).toFixed(2)}px`);
                set(scene.stage, '--story-photo-turn', `${(lerp(wide.matches ? 12 : 4, -8, move)).toFixed(2)}deg`);
                set(scene.stage, '--story-photo-scale', lerp(wide.matches ? 1.04 : 1, .92, move).toFixed(3));
                set(scene.stage, '--story-photo-x', `${lerp(80, -28, move).toFixed(2)}px`);
                set(scene.stage, '--story-photo-depth', `${(60 * (1 - move)).toFixed(2)}px`);
                set(scene.stage, '--story-photo-y', `${(16 * move).toFixed(2)}px`);
                set(scene.stage, '--story-copy-x', `${(75 * (1 - move)).toFixed(2)}px`);
                set(scene.stage, '--story-copy-y', `${(12 * (1 - move)).toFixed(2)}px`);
            } else if (scene === scenes.services) {
                const camera = distance * position / (scene.items.length - 1);
                set(scene.track, '--service-camera-x', `${(-camera).toFixed(2)}px`);
                scene.items.forEach((card, index) => {
                    const relative = clamp((servicePositions[index].centre - camera - width / 2) / width, -1.5, 1.5);
                    set(card, '--service-turn', `${(-relative * 7).toFixed(2)}deg`);
                    set(card, '--service-lift', `${(Math.abs(relative) * 8).toFixed(2)}px`);
                    set(card, '--service-depth', `${(Math.max(0, 1 - Math.abs(relative)) * 14).toFixed(2)}px`);
                });
            } else {
                scene.items.forEach((card, index) => {
                    const delta = index - position;
                    const arc = clamp(delta, -1.6, 1.6);
                    const front = String(index === Math.round(position));
                    if (card.dataset.front !== front) card.dataset.front = front;
                    set(card, '--principle-x', `${(Math.sin(arc * .85) * Math.min(width * .64, 365)).toFixed(2)}px`);
                    set(card, '--principle-y', `${(Math.abs(arc) * 12).toFixed(2)}px`);
                    set(card, '--principle-z', `${(-Math.abs(delta) * 145).toFixed(2)}px`);
                    set(card, '--principle-turn', `${(-arc * 20).toFixed(2)}deg`);
                    set(card, '--principle-opacity', Math.abs(delta) > 1.6 ? '0' : '1');
                    set(card, '--principle-layer', Math.round(20 - Math.abs(delta) * 4));
                });
            }
        });
    }
    function scheduleFrame() {
        if (!framePending) { framePending = true; requestAnimationFrame(updateScroll); }
    }
    addEventListener('scroll', scheduleFrame, { passive: true });
    addEventListener('resize', scheduleLayout);
    addEventListener('pageshow', scheduleLayout);
    addEventListener('load', scheduleLayout);
    document.fonts?.ready.then(scheduleLayout);
    if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(scheduleLayout);
        [journeyStage, $('.services-heading'), $('.why-intro'), ...scenes.story.items, ...scenes.services.items, ...scenes.approach.items].forEach(element => observer.observe(element));
    }
    reduced.addEventListener('change', () => { observeReveals(); observeTitles(); configureLayout(); });
    observeReveals();
    prepareTitles();
    observeTitles();
    if (!reduced.matches) {
        document.body.classList.add('intro-ready');
        setTimeout(() => document.body.classList.remove('intro-ready'), 1600);
    }
    configureLayout();
})();
