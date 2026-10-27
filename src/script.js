
        // --- Theme Toggle ---
        const themeToggleBtn = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');

        // Setup initial theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);

        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });

        function updateThemeIcon(theme) {
            if (theme === 'light') {
                themeIcon.classList.remove('fa-sun');
                themeIcon.classList.add('fa-moon');
            } else {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        }

        // --- Custom Cursor ---
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorOutline = document.querySelector('.cursor-outline');

        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        const interactives = document.querySelectorAll('a, button, .btn, .stat-card, .project-card, .tech-item, .profile-card, .cert-card');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.backgroundColor = 'rgba(0, 240, 255, 0.1)';
                cursorOutline.style.borderColor = 'var(--neon-blue)';
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.backgroundColor = 'transparent';
                cursorOutline.style.borderColor = 'rgba(138, 43, 226, 0.5)';
            });
        });

        // --- Sticky Navbar ---
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // --- Typing Animation ---
        const typingText = document.getElementById('typing-text');
        const phrases = [
            "I build AI systems.",
            "I ship fast.",
            "I solve real problems."
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingDelay = 100;

        function type() {
            const currentPhrase = phrases[phraseIndex];

            if (isDeleting) {
                typingText.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
                typingDelay = 50;
            } else {
                typingText.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
                typingDelay = 100;
            }

            if (!isDeleting && charIndex === currentPhrase.length) {
                isDeleting = true;
                typingDelay = 2000;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typingDelay = 500;
            }

            setTimeout(type, typingDelay);
        }

        setTimeout(type, 1000);

        // --- Scroll Reveal & Number Counters ---
        const revealElements = document.querySelectorAll('.reveal');
        const counters = document.querySelectorAll('.counter');
        let countersStarted = false;

        function startCounters() {
            if (countersStarted) return;
            countersStarted = true;

            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const duration = 2000;
                const increment = target / (duration / 16);

                let current = 0;
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCounter();
            });
        }

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');

                    if(entry.target.querySelector('.stats-grid') || entry.target.classList.contains('stats-grid')) {
                        startCounters();
                    }
                }
            });
        }, { threshold: 0.15 });

        revealElements.forEach(el => revealObserver.observe(el));

        if(document.getElementById('stats').getBoundingClientRect().top < window.innerHeight) {
            startCounters();
        }

        // --- Particle Network Background ---
        const canvas = document.getElementById('bg-canvas');
        const ctx = canvas.getContext('2d');

        let width, height, particles;

        function initCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];

            const particleCount = Math.floor((width * height) / 15000);

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 1.5 + 0.5
                });
            }
        }

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);

            const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';

            ctx.fillStyle = isLightMode ? 'rgba(2, 132, 199, 0.5)' : 'rgba(0, 240, 255, 0.5)';

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.strokeStyle = isLightMode ? 'rgba(126, 34, 206, 0.15)' : 'rgba(138, 43, 226, 0.15)';
            ctx.lineWidth = 0.5;

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);

                        const opacity = 0.2 - dist/750;
                        ctx.strokeStyle = isLightMode ? `rgba(126, 34, 206, ${opacity})` : `rgba(138, 43, 226, ${opacity})`;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(drawParticles);
        }

        window.addEventListener('resize', initCanvas);
        initCanvas();
        drawParticles();
