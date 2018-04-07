import { Point } from '../src/point';
import { distance } from '../src/distance';

let point1: Point = { x: 1, y: 1 };

let point2: Point = { x: 4, y: 5 };

if(distance(point1, point2) !== 5) {
  throw new Error('test failed');
}

if(distance(point2, point1) !== 5) {
  throw new Error('test failed');
}

console.log('Tests succeeded');
