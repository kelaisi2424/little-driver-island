import type { CarDefinition, CarId } from '../types';

export const CARS: readonly CarDefinition[] = [
  {
    id: 'red-car',
    name: '红色小车',
    shortName: '红车',
    bodyColor: '#ff5f5f',
    roofColor: '#ffd4d4',
    accentColor: '#b92828',
    emoji: '🚗',
  },
  {
    id: 'blue-car',
    name: '蓝色小车',
    shortName: '蓝车',
    bodyColor: '#42a5ff',
    roofColor: '#d8efff',
    accentColor: '#176cb2',
    emoji: '🚙',
  },
  {
    id: 'yellow-bus',
    name: '黄色小巴士',
    shortName: '巴士',
    bodyColor: '#ffd34f',
    roofColor: '#fff2b6',
    accentColor: '#c38800',
    emoji: '🚌',
  },
  {
    id: 'green-truck',
    name: '绿色工程车',
    shortName: '工程车',
    bodyColor: '#5cc978',
    roofColor: '#d9f6df',
    accentColor: '#268340',
    emoji: '🚜',
  },
];

export function getCar(carId: CarId): CarDefinition {
  return CARS.find((car) => car.id === carId) ?? CARS[0];
}
