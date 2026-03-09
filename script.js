document.addEventListener('DOMContentLoaded', () => {

    // 1. Navigation Scrolled State
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 3. Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;

        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load

    // 4. Mouse Hover Effect for Service Cards (Dynamic gradient)
    const cards = document.querySelectorAll('.service-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            // Utilisation des pixels pour un effet plus précis sur le dégradé radial
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // 5. Form Submission via Webhook n8n
    const contactForm = document.getElementById('contactForm');
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            
            btn.textContent = 'Envoi en cours...';
            btn.style.opacity = '0.8';
            
            // Webhook n8n integration
            fetch('https://tynisha-spadiceous-maudie.ngrok-free.dev/webhook/2e6fcc03-a79a-4c7f-b7bb-a86c4c04dee4', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom: contactForm.querySelector('#name').value, 
                    email: contactForm.querySelector('#email').value,
                    message: contactForm.querySelector('#message').value
                }),
            })
            .then(response => {
                if (response.ok) {
                    // Succès : ton code de changement de couleur verte
                    btn.textContent = 'Demande envoyée !';
                    btn.style.background = '#10b981';
                    contactForm.reset();
                    
                    // Remise à zéro après 3 secondes
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '';
                        btn.style.opacity = '1';
                    }, 3000);
                } else {
                    btn.textContent = 'Erreur d\'envoi';
                    btn.style.background = '#ef4444'; // Rouge
                    
                    // Remise à zéro après 3 secondes
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '';
                        btn.style.opacity = '1';
                    }, 3000);
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                btn.textContent = 'Erreur réseau';
                btn.style.background = '#ef4444'; // Rouge
                
                // Remise à zéro après 3 secondes
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.style.opacity = '1';
                }, 3000);
            });
        });
    }

});
