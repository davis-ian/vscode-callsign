// import { computed, type Ref } from 'vue';
// import type {
//     OpenApiSpec,
//     OpenApiRoute,
//     GroupedRoutes,
//     ParameterObject,
//     RequestBodyObject,
//     ResponseObject,
// } from '@/types';

// const validMethods: OpenApiRoute['method'][] = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'];

// export function useRouteGroups(openApiSpec: Ref<OpenApiSpec | null>, search: Ref<string>) {
//     const paths = computed(() => openApiSpec.value?.paths || {});

//     const groups = computed(() => {
//         const spec = openApiSpec.value;
//         if (!spec?.paths) return [];

//         const searchTerm = search.value.toLowerCase();
//         const filteredPaths = searchTerm ? filterPathsBySearch(spec.paths, searchTerm) : spec.paths;

//         return organizePathsByTag(filteredPaths);
//     });

//     const totalRouteCount = computed(() => Object.keys(paths.value).length);
//     const filteredRouteCount = computed(() => groups.value.reduce((sum, g) => sum + Object.keys(g.routes).length, 0));

//     const matchedRoutes = computed(() => {
//         if (!search.value) return [];
//         const term = search.value.toLowerCase();
//         return Object.keys(paths.value).filter(route => route.toLowerCase().includes(term));
//     });

//     return {
//         paths,
//         groups,
//         totalRouteCount,
//         filteredRouteCount,
//         matchedRoutes,
//     };
// }

// export function organizePathsByTag(rawPaths: OpenApiSpec['paths']): GroupedRoutes[] {
//     const groupsMap: Record<string, GroupedRoutes> = {};

//     for (const [routePath, operations] of Object.entries(rawPaths)) {
//         for (const method of validMethods) {
//             const operation = operations[method];
//             if (!operation) continue;

//             const tag = operation.tags?.[0] || 'Uncategorized';

//             if (!groupsMap[tag]) {
//                 groupsMap[tag] = { tag, routes: {} };
//             }

//             if (!groupsMap[tag].routes[routePath]) {
//                 groupsMap[tag].routes[routePath] = {} as GroupedRoutes['routes'][string];
//             }

//             groupsMap[tag].routes[routePath][method] = {
//                 method: method as OpenApiRoute['method'],
//                 route: routePath,
//                 details: {
//                     description: operation.description,
//                     parameters: operation.parameters,
//                     requestBody: operation.requestBody,
//                     responses: operation.responses,
//                     summary: operation.summary || '',
//                 },
//             };
//         }
//     }

//     return Object.values(groupsMap);
// }

// function filterPathsBySearch(paths: OpenApiSpec['paths'], term: string): OpenApiSpec['paths'] {
//     return Object.fromEntries(
//         Object.entries(paths).filter(([route, methods]) => {
//             return (
//                 route.toLowerCase().includes(term) ||
//                 Object.values(methods).some(op => op.summary?.toLowerCase().includes(term))
//             );
//         }),
//     );
// }
