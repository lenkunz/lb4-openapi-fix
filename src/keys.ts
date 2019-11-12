import { Loopback4OpenApiFixComponent } from "./Loopback4OpenApiFix.component";
import { BindingKey } from "@loopback/core";

export namespace Loopback4OpenApiFixBindings {
    export const COMPONENT = BindingKey.create<Loopback4OpenApiFixComponent>(
        'components.Loopback4OpenApiFixComponent',
    );    
}