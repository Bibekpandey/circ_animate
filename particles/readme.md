# PARTICLES

A simple package to rendet text as particles in HTML canvas element.

## Usage
Import `{ ParticlesRenderer }` and use it as
```javascript
const renderer = new ParticlesRenderer(<canvas element where you want to render>);
renderer.renderTextparticles('TEXT'); // Shorter text is better
renderer.animate();
```
Just these lines should do the task. For further customization, you can pass in properties for renderer and particles as,
```javascript
const renderer = new ParticlesRenderer(canvas, rendererProps, particleProps);
// rendererProps and particlceProps are just plain JS objects
```
The following are default values for renderer props:
```javascript
{
    fps: 60,
    bgColor: 'black',
    width: 900,
    height: 900,
}
```
The following are default values for particles props:
```javascript
{
    size: 2,
    position: {x: 0, y: 0}, // origin is center of canvas and +y is up
    velocity: {x: 0, y: 0},
    acceleration: {x: 0, y: 0},
    color: 'cyan',
    damping: 0.1,
    K: 0.01
}
```
