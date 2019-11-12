import { OpenApiSpec, PathItemObject, OperationObject, ParameterObject, ReferenceObject, RestServer, RequestContext } from "@loopback/rest";

export namespace Lb4OpenApiSpec {
    function findAndRemoveInvalidExamplesProperty(
        schema: any
    ) {
        if (Array.isArray(schema)) {
            for(const value in schema) {
                findAndRemoveInvalidExamplesProperty(schema[value]);
            }
        } else {
            for(const key in schema) {
                if (key === 'examples') {
                    schema[key] = undefined;
                } else if (typeof schema[key] === 'object') {
                    findAndRemoveInvalidExamplesProperty(schema[key]);
                }
            }
        }
    }

    function findAndFixPropertyOfOperation(operation: OperationObject) {
        // Fix the spec name, remove suffix 'Controller' from the name.
        let controllerName = operation['x-controller-name'] as string;
        if (controllerName && typeof controllerName === 'string') {
            controllerName = controllerName.trim();

            if (
                controllerName.length !== 0 &&
                controllerName.toLowerCase().endsWith('controller')
            ) {
                operation['x-controller-name'] = controllerName.substring(
                    0, 
                    controllerName.length - 'controller'.length
                );
            }
        }

        // Fix operationId prefix separator.
        // Change from dot to underscore.
        let operationId = operation.operationId as string;
        if (operationId && typeof operationId === 'string') {
            const operationIdParts = operationId.split('.');
            operation.operationId = operationIdParts.join('_');
        }
    }

    export function shapeApiSpecToMeetValidation(spec: OpenApiSpec) {
        const paths = spec.paths;

        for(const endpoint in paths) {
            const endpointInfo = paths[endpoint] as PathItemObject;

            for(const method in endpointInfo) {
                if ([
                        'get',
                        'put', 
                        'post', 
                        'delete', 
                        'options', 
                        'head', 
                        'patch', 
                        'trace'
                    ].indexOf(method) !== -1
                ) {
                    findAndFixPropertyOfOperation(endpointInfo[method]);
                    
                    if (endpointInfo[method].parameters) {
                        findAndRemoveInvalidExamplesProperty(endpointInfo[method].parameters);
                    }
                } else if (method === 'paramters') {
                    findAndRemoveInvalidExamplesProperty(endpointInfo[method]);
                }
            }
        }

        return spec;
    }

    export function modifyRestServer(rest: RestServer) {
        const getApiSpec = rest.getApiSpec.bind(rest);
        rest.getApiSpec = (requestContext?: RequestContext) => {
          const spec = getApiSpec(requestContext);
          return shapeApiSpecToMeetValidation(spec);
        };        
    }
}