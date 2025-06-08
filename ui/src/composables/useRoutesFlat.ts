import { computed, type Ref } from 'vue';
import type { OpenApiSpec, OpenApiRoute } from '@/types';

const validMethods: OpenApiRoute['method'][] = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace'];

export function useRoutesFlat(openApiSpec: Ref<OpenApiSpec | null>, search: Ref<string>) {
    const total = computed(() => {
        const spec = openApiSpec.value;
        if (!spec?.paths) return 0;

        let count = 0;

        for (const operations of Object.values(spec.paths)) {
            for (const method of validMethods) {
                if (operations[method]) count++;
            }
        }

        return count;
    });

    const filteredMethods = computed<OpenApiRoute[]>(() => {
        const spec = openApiSpec.value;
        if (!spec?.paths) return [];

        const searchTerm = search.value.toLowerCase();
        const result: OpenApiRoute[] = [];

        for (const [path, operations] of Object.entries(spec.paths)) {
            for (const method of validMethods) {
                const op = operations[method];
                if (!op) continue;

                const summary = op.summary || '';
                if (
                    searchTerm &&
                    !path.toLowerCase().includes(searchTerm) &&
                    !summary.toLowerCase().includes(searchTerm)
                ) {
                    continue;
                }

                result.push({
                    method,
                    path,
                    details: {
                        description: op.description,
                        parameters: op.parameters,
                        requestBody: op.requestBody,
                        responses: op.responses,
                        summary,
                    },
                });
            }
        }

        return result;
    });

    return {
        routes: filteredMethods,
        total,
    };
}
