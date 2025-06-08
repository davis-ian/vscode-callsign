import type { OpenApiRoute } from '@/types';
import { type Ref, inject, provide } from 'vue';

export const SelectedRouteSymbol = Symbol('SelectedRoute');

export function provideSelectedRoute(route: Ref<OpenApiRoute | null>) {
    provide(SelectedRouteSymbol, route);
}

export function useSelectedRoute(): Ref<OpenApiRoute | null> {
    const route = inject<Ref<any>>(SelectedRouteSymbol);
    if (!route) throw new Error('SelectedRoute not provided');
    return route;
}
