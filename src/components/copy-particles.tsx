"use client"
import React, { useEffect, useRef } from 'react';

const CopyParticles = ({ show }: {show: boolean}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!show || !containerRef.current) return;

        const container = containerRef.current;
        const particleCount = 15;
        const colors = ['#22c55e', '#16a34a', '#15803d']; // Different shades of green

        // Clear any existing particles
        container.innerHTML = '';

        // Create and animate particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 4 + 4; // Random size between 4-8px
            
            // Random position around the button
            const angle = (Math.random() * 360) * (Math.PI / 180);
            const velocity = 2 + Math.random() * 3; // Increased velocity range
            const startDistance = 0;
            const endDistance = 40 + Math.random() * 40; // Increased distance

            particle.className = 'absolute rounded-full';
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.transform = `translate(-50%, -50%)`;

            container.appendChild(particle);

            // Animate the particle
            const startTime = performance.now();
            const duration = 800 + Math.random() * 200; // Random duration between 800-1000ms
            let currentVelocity = velocity * 2; // Initial velocity

            const animate = (currentTime: number) => {
                const elapsed = currentTime - startTime;
                const progress = elapsed / duration;

                if (progress < 1) {
                    // Apply physics-like motion with velocity decay
                    currentVelocity *= 0.95; // Velocity decay factor
                    
                    // Calculate current position with velocity influence
                    const distance = startDistance + (endDistance - startDistance) * 
                        (1 - Math.pow(1 - progress, currentVelocity));
                    
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance;

                    // Add a slight rotation effect
                    const rotation = progress * 360 * (Math.random() > 0.5 ? 1 : -1);
                    
                    // Apply position, rotation and fade out with easing
                    particle.style.left = `${x}px`;
                    particle.style.top = `${y}px`;
                    particle.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
                    particle.style.opacity = Math.min(1, 2 * (1 - progress)).toString();

                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };

            requestAnimationFrame(animate);
        }
    }, [show]);

    return (
        <div 
            ref={containerRef} 
            className="absolute inset-0 pointer-events-none overflow-visible z-50"
            style={{ perspective: '1000px' }}
        />
    );
};

export default CopyParticles;