import { abs, sqr } from './utils';
import { Point } from './point';

export let distance = (point1: Point, point2: Point): number => {
  return Math.sqrt(sqr(abs(point1.x - point2.x)) + sqr(abs(point1.y - point2.y)));
};
