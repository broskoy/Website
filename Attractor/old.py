import pygame
import math
import random
import numpy

pygame.init()
screen_size = screen_width, screen_height = 1920, 1080
screen = pygame.display.set_mode(screen_size)
pygame.display.set_caption("yes i am")

def dot(x, y, diameter, color):
  pygame.draw.circle(screen, color, (x, y), diameter/2, 0)

def init_xyz():
  return [random.uniform(-3, 3) for _ in range(3)]

def new_pos(x, y, z, t):
  if math.fabs(x) > 100 or math.fabs(y) > 100 or math.fabs(z) > 100:
    x, y, z = init_xyz()

  dt = t/(5e3)
  a = 1.89
  new_x = x + dt * (-a*x-4*y-4*z-y**2)
  new_y = y + dt * (-a*y-4*z-4*x-z**2)
  new_z = z + dt * (-a*z-4*x-4*y-x**2)

  return (new_x, new_y, new_z)

clock = pygame.time.Clock()
fps_limit = 60
running = True
dots = [init_xyz() for _ in range(1000)]
dot_color = numpy.array((150, 100, 150))
dots_color = [dot_color + random.randint(0, 30) for _ in range(len(dots))]

while running:
  clock.tick(fps_limit)

  for event in pygame.event.get():
    if event.type == pygame.QUIT:
      running = False

  screen.fill((0, 0, 0))

  for i, d in enumerate(dots):
    x, y, z = dots[i] = new_pos(d[0], d[1], d[2], 16)
    colors = list(dots_color[i] + (z*5))
    dot(x*40+screen_width/2+100, y*40+screen_height/2+100, 10, colors)

  pygame.display.flip()

pygame.quit()