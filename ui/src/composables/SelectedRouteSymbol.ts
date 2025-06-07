import { type Ref, inject, provide } from 'vue';

export const SelectedRouteSymbol = Symbol('SelectedRoute');

export function provideSelectedRoute(route: Ref<any>) {
    provide(SelectedRouteSymbol, route);
}

export function useSelectedRoute(): Ref<any> {
    const route = inject<Ref<any>>(SelectedRouteSymbol);
    if (!route) throw new Error('SelectedRoute not provided');
    return route;
}
