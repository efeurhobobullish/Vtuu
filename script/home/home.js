// ScrollReveal Animations
ScrollReveal().reveal('.hero, .services, .testimonials, .contact', { 
  delay: 200, 
  distance: '50px', 
  origin: 'bottom', 
  duration: 1000 
});

// Swiper.js for Testimonials
var swiper = new Swiper('.testimonial-slider', {
  slidesPerView: 1,
  spaceBetween: 20,
  loop: true,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  autoplay: {
    delay: 3000,
  },
});

// Contact Form Submission
document.querySelector("form").addEventListener("submit", function(event) {
  event.preventDefault();
  alert("Thank you for reaching out! We'll get back to you soon.");
});
  
