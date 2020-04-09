import Haste
import Haste.Graphics.Canvas
import Haste.Graphics.AnimationFrame

import Data.IORef

data Particle = Particle {
    position :: Point,
    speed :: Point
}

updateParticle :: Particle -> Particle
updateParticle (Particle pos speed) = Particle (fst pos + fst speed, snd pos + snd speed) speed

blue :: Picture() -> Picture()
blue = color (RGB 0 0 255)

renderParticle :: Particle -> Picture()
renderParticle (Particle pos _) = blue $ do
    fill $ rect (x, y) ((x+1), (y+1))
        where x = fst pos
              y = snd pos

renderParticles :: [Particle] -> Picture()
renderParticles [] = do
    color (RGBA 0 0 0 0.0) $ fill $ rect (1,1) (1, 1)  -- this is hack
renderParticles (x:xs) = do
    renderParticle x
    renderParticles xs


particles = [Particle {position=(100, 100), speed=(1.0, 1.0)}]

animate :: Canvas -> IORef [Particle] -> IO ()
animate canvas particlesRef = do
  particles <- readIORef particlesRef -- extract state from reference object
  renderParticles particles -- draw game picture
  atomicWriteIORef particlesRef $ map updateParticle particles -- update state and rewrite state reference
  -- setTimeout 30 $ animate canvas particlesRef  -- sleep. then loop

{-particles :: [Particle]
particles = [
    Particle {position=(100, 100), speed=(1.0, 1.0)},
    Particle {position=(100, 100), speed=(1.0, 0.5)}
]-}

main :: IO ()
main = do
    Just canvas <- getCanvasById "canvas"
    particlesRef <- newIORef particles
    requestAnimationFrame $ \ts -> animate canvas particlesRef
