# PARTICLES

A simple package to rendet text as particles in HTML canvas element.  
Demo [here](https://bewakes.com/html-js-stuffs/particles/index.html)

![Demo](https://bewakes.com/media/blog-images/demo.gif "Demo")


## Usage
Import `{ ParticlesRenderer }` and use it as
```javascript
const renderer = new ParticlesRenderer(<canvas element>);
renderer.renderTextparticles('TEXT'); // Shorter text is better
renderer.start();
```
Just these lines should do the task. For further customization, you can pass in properties for renderer, particles and force(the mouse pointer) as,
```javascript
const renderer = new ParticlesRenderer(canvas, rendererProps, particleProps, forceProps);
// rendererProps, particlceProps, forceProps are just plain JS objects
```
The following are default values for renderer props:
```javascript
defaultRendererProps = {
    fps:80,
    bgColor:'black',
    width:900,
    height:900,
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
The following are default values for force props: 
```javascript
// force is the mouse pointer exerting some force to particles rendered
defaultForceProps = {
    position: {x: 1000, y: 1000},
    radius: 20,
    maxMagnitude: 50,
}
```
So, in case of any dynamic events, for example: resizing the page, the `cleanUp()` method should be called.
```javascfript
// The following code is the initialization
const renderer = new ParticlesRenderer(canvas);
renderer.renderTextparticles('TEXT');
renderer.start();
// Now, when you need to do cleanUp, call the method(it's recommended)
renderer.cleanUp();
```
