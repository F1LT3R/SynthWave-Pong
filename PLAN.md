# Two Player Pong

I want to make a Web GL recreation of the classic arcade game PONG.

This will be two human players, one on keyboard, one on mouse.

Use 3D paddles and 3D pong ball. Use translucent shaded faces, and show wire-frames to give it a retro futuristic feel.

The theme is SynthWave Neon Dark.

Use Web Audio API for sound effect synthesis. Featuring classic game type sounds from early computers.

Shader effects on collisions, scores, game start, game end etc.

Game ends when player score 5. Then "Play new game?" screen shows up, and Y or Mouse press starts new game.

Scoreboard graphic needed.

Every few seconds (or better timing), a obstacle box appears in the playing field. When the pong ball hits the box, the ball bounces off it, and the box disappears. Make the box explode when ball hits! Use cool shader effects, and boxes send off shards of broken faces.

There is a middle line in the screen to show which half of the field the ball is on.

I want multiple agents working in a team.

Team Members:

1. Game dev: handles collisions, game architecture, draw loops, timers, etc.
2. Audio dev: handles game sounds and web audio api.
3. Graphics dev: handles shader effects, color theming, 3d visual effects and animations.