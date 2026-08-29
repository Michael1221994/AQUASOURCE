export class CubeManager {
    constructor() {
        this.cubes = [];
    }

    init() {
        this.cubes = Array.from(document.querySelectorAll('.cube-container'));
        
        this.cubes.forEach(cube => {
            cube.addEventListener('mouseenter', (e) => this.onMouseEnter(e, cube));
            cube.addEventListener('mousemove', (e) => this.onMouseMove(e, cube));
            cube.addEventListener('mouseleave', (e) => this.onMouseLeave(e, cube));
            cube.addEventListener('click', (e) => this.onClick(e, cube));
            // Touch support for mobile
            cube.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.onClick(e, cube);
            }, { passive: false });
        });
    }

    onMouseEnter(e, cube) {
        // Init any hover state if needed
    }

    onMouseMove(e, cube) {
        if (cube.classList.contains('is-active')) return;
        
        const rect = cube.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const x = e.clientX - centerX;
        const y = e.clientY - centerY;
        
        const rotateX = (y / (rect.height / 2)) * -8;
        const rotateY = (x / (rect.width / 2)) * 8;
        
        const wrapper = cube.querySelector('.cube-wrapper');
        if (wrapper) {
            wrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
    }

    onMouseLeave(e, cube) {
        if (cube.classList.contains('is-active')) return;
        
        const wrapper = cube.querySelector('.cube-wrapper');
        if (wrapper) {
            wrapper.style.transform = '';
        }
    }

    onClick(e, cube) {
        const wrapper = cube.querySelector('.cube-wrapper');
        if (!wrapper) return;

        if (cube.classList.contains('is-active')) {
            cube.classList.remove('is-active');
            wrapper.style.transform = '';
            if (cube.resetTimeout) {
                clearTimeout(cube.resetTimeout);
                cube.resetTimeout = null;
            }
        } else {
            cube.classList.add('is-active');
            wrapper.style.transform = 'rotateY(180deg)';
            
            if (cube.resetTimeout) {
                clearTimeout(cube.resetTimeout);
            }
            
            cube.resetTimeout = setTimeout(() => {
                cube.classList.remove('is-active');
                wrapper.style.transform = '';
            }, 1500);
        }
    }
}
