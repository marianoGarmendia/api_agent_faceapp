import {
  AIMessage,
  SystemMessage,
  ToolMessage,
  type BaseMessageLike,
} from "@langchain/core/messages";
import {
  ActionRequest,
  HumanInterrupt,
  HumanInterruptConfig,
  HumanResponse,
} from "@langchain/langgraph/prebuilt";
// import { tool } from "@langchain/core/tools";
// import { z } from "zod";
import {
  Annotation,
  END,
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
  interrupt,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { TavilySearch } from "@langchain/tavily";
// import { ToolNode } from "@langchain/langgraph/prebuilt";
import { encode } from "gpt-3-encoder";
import { createbookingTool, getAvailabilityTool } from "./booking-cal.mjs";
import { getPisos2, pdfTool } from "./pdf-loader_tool.mjs";
// import { ensureToolCallsHaveResponses } from "./ensure-tool-response.mjs";
// import { getUniversalFaq, noticias_y_tendencias } from "./firecrawl";

import { contexts } from "./contexts.mjs";
import { INMUEBLE_PROPS } from "./products_finder/schemas.mjs";
import { productsFinder } from "./products_finder/tools.mjs";

export const empresa = {
  eventTypeId: contexts.clinica.eventTypeId,
  context: contexts.clinica.context,
};

// process.env.LANGCHAIN_CALLBACKS_BACKGROUND = "true";
// import * as dotenv from "dotenv";
// dotenv.config();

const tavilySearch = new TavilySearch({
  tavilyApiKey: process.env.TAVILY_API_KEY,
  description:
    "Herramienta para buscar colegios, escuelas, clubes, ubicacion del mar , y relacionarlo con la zona de la propiedad",
  name: "tavily_search",
});

const tools = [
  getAvailabilityTool,
  createbookingTool,
  tavilySearch,
  productsFinder,
];

const stateAnnotation = MessagesAnnotation;

const newState = Annotation.Root({
  ...stateAnnotation.spec,
  summary: Annotation<string>,
  interruptResponse: Annotation<string>,
});

// export const llmGroq = new ChatGroq({
//   model: "llama-3.3-70b-versatile",
//   apiKey: process.env.GROQ_API_KEY,
//   temperature: 0,
//   maxTokens: undefined,
//   maxRetries: 2,
//   // other params...
// }).bindTools(tools);

export const model = new ChatOpenAI({
  model: "gpt-4o",
  streaming: false,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
}).bindTools(tools);

// const toolNode = new ToolNode(tools);

async function callModel(state: typeof newState.State) {
  const { messages } = state;

  // console.log("sumary agent en callModel");
  // console.log("-----------------------");
  // console.log(summary);

  const systemsMessage = new SystemMessage(
    `
  Sos Ana, el asistente de voz de la inmobiliaria María. Ayudás a las personas a buscar propiedades en venta, agendar visitas y resolver dudas frecuentes. Tenés acceso a herramientas para buscar propiedades y agendar turnos, pero primero necesitás recopilar los datos necesarios, paso a paso.

Tu estilo es cálido, profesional y sobre todo **persuasivo pero no invasivo**. Las respuestas deben ser **breves, naturales y fáciles de seguir en una conversación oral**. No hables demasiado seguido sin dejar espacio para que el usuario responda.

### 🧠 Comportamiento ideal:
- Si encontrás varias propiedades relevantes, avisá cuántas son y **mencioná solo la zona de cada una**. Por ejemplo:  
  “Encontré 3 propiedades que podrían interesarte. Una está en Gracia, otra en El Born y la tercera en Poblenou. ¿Querés que te cuente más sobre alguna en particular?”

- Si el usuario elige una, describí **solo 2 o 3 características importantes**, como:  
  “Es un departamento de 3 habitaciones, con 2 baños y una terraza amplia.”  
  Luego preguntá:  
  “¿Querés que te cuente más detalles o preferís escuchar otra opción?”

- **Siempre ayudalo a avanzar**. Si duda, orientalo con sugerencias:  
  “Si querés, puedo contarte la siguiente opción.”

- Cuando haya interés en una propiedad, preguntá su disponibilidad para una visita y usá las herramientas correspondientes para consultar horarios y agendar.

---

### 🧱 Reglas de conversación

- **No hagas preguntas múltiples**. Preguntá una cosa por vez: primero la zona, después el presupuesto, después habitaciones, despues metros cuadrados , piscina etc.
- **No repitas lo que el usuario ya dijo**. Escuchá con atención y respondé directo al punto.
- **No inventes información**. Si algo no lo sabés, ofrecé buscarlo o contactar a un asesor.
- **No agendes visitas para propiedades en alquiler.**
- **Usá respuestas naturales y fluidas** como si fuera una charla con una persona real. Evitá frases técnicas o robotizadas.
- **No uses emojis**.
- **Solo podes responder con la informacion de contexto , las caracteristicas de los pisos, de las funciones que podes realizar pero no digas como las utilizas, solo di que lo haras.**
- Si el usuario menciona el mar o alguna zona específica que quiera saber que hay cerca de la casa o buscar una casa cerca de un colegio, cerca del mar o en alguna zona en particular, haz lo siguiente:
- usa la herramienta “tavily_search” para ubicar la zona y buscar colegios, escuelas, clubes, ubicacion del mar , y relacionarlo con la zona de la propiedad.
- Busca una propiedad cerca de la zona de busqueda y si hay colegios, escuelas, clubes, ubicacion del mar , y relacionarlo con la zona de la propiedad.

---

### 🛠️ Herramientas disponibles

- Obtener_pisos_en_venta_dos: para buscar propiedades en venta.
- get_availability_Tool: para verificar horarios disponibles para visitas.
- create_booking_tool: para agendar la visita.
- "tavily_search": para consultar información del clima, actividades o puntos de interés de una zona.
- "products_finder": para buscar propiedades en venta y obtener información sobre ellas según la consulta del usuario.



---

### REGLAS PARA RECOPILACION DE INFORMACION PARA HERRAMIENTAS
- "products_finder" (para buscar propiedades en venta y obtener información sobre ellas según la consulta del usuario):
- query: string (consulta del usuario sobre la propiedad buscada).
- Para armar la consulta, tené en cuenta lo siguiente:
- número de habitaciones, ubicacion, metros cuadrados, piscina, precio aproximado
- Esa información debes detectarla de la consulta del ususario
- intenta que esté lo mas completa posible antes de armar la "query" de consulta.
- Si el usuario no proporciona toda la información, hacé preguntas para obtenerla. Por ejemplo: "¿Cuántas habitaciones necesitas?" o "¿Cuál es tu presupuesto aproximado?".



### ℹ️ Información adicional

- Hoy es **${new Date().toLocaleDateString()}** y la hora actual es **${new Date().toLocaleTimeString()}**.
- Las visitas están disponibles de **lunes a viernes entre las 9:00 y las 18:00 hs**, en bloques de 30 minutos.
- Todos los precios están en **euros**.

  
 `,
  );

  const response = await model.invoke([systemsMessage, ...messages]);

  // console.log("response: ", response);

  const cadenaJSON = JSON.stringify(messages);
  // Tokeniza la cadena y cuenta los tokens
  const tokens = encode(cadenaJSON);
  const numeroDeTokens = tokens.length;
  console.log("Tokens: ", numeroDeTokens);

  // console.dir( state.messages[state.messages.length - 1], {depth: null});

  // console.log(`Número de tokens: ${numeroDeTokens}`);

  return { messages: [...messages, response] };

  // console.log(messages, response);

  // We return a list, because this will get added to the existing list
}

function shouldContinue(state: typeof newState.State) {
  const { messages } = state;

  const lastMessage = messages[messages.length - 1] as AIMessage;
  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage?.tool_calls?.length) {
    return "tools";
  } else {
    return END;
  }

  // Otherwise, we stop (reply to the user)
}

const humanNode = (lastMessage: any) => {
  const toolArgs = lastMessage.tool_calls[0].args as {
    habitaciones: string | null;
    precio_aproximado: string;
    zona: string;
    superficie_total: string | null;
    piscina: "si" | "no" | null;
    tipo_operacion: "venta" | "alquiler";
  };

  const {
    habitaciones,
    precio_aproximado,
    zona,
    piscina,
    superficie_total,
    tipo_operacion,
  } = toolArgs;

  // Define the interrupt request
  const actionRequest: ActionRequest = {
    action: "Confirma la búsqueda",
    args: toolArgs,
  };

  const description = `Por favor, confirma la búsqueda de propiedades con los siguientes parámetros: ${JSON.stringify(
    {
      habitaciones,
      precio_aproximado,
      zona,
      piscina,
      superficie_total,
      tipo_operacion,
    },
  )}`;

  const interruptConfig: HumanInterruptConfig = {
    allow_ignore: false, // Allow the user to `ignore` the interrupt
    allow_respond: false, // Allow the user to `respond` to the interrupt
    allow_edit: true, // Allow the user to `edit` the interrupt's args
    allow_accept: true, // Allow the user to `accept` the interrupt's args
  };

  const request: HumanInterrupt = {
    action_request: actionRequest,
    config: interruptConfig,
    description,
  };

  const humanResponse = interrupt<HumanInterrupt[], HumanResponse[]>([
    request,
  ])[0];
  console.log("request: ", request);

  console.log("humanResponse: ", humanResponse);

  if (humanResponse.type === "response") {
    const message = `User responded with: ${humanResponse.args}`;
    return { interruptResponse: message, humanResponse: humanResponse.args };
  } else if (humanResponse.type === "accept") {
    const message = `User accepted with: ${JSON.stringify(humanResponse.args)}`;
    return { interruptResponse: message, humanResponse: humanResponse };
  } else if (humanResponse.type === "edit") {
    const message = `User edited with: ${JSON.stringify(humanResponse.args)}`;
    return { interruptResponse: message, humanResponse: humanResponse.args };
  } else if (humanResponse.type === "ignore") {
    const message = "User ignored interrupt.";
    return { interruptResponse: message, humanResponse: humanResponse };
  }

  return {
    interruptResponse:
      "Unknown interrupt response type: " + JSON.stringify(humanResponse),
  };
};

interface pisosToolArgs {
  habitaciones: string | null;
  precio_aproximado: string;
  zona: string;
  superficie_total: string | null;
  piscina: "si" | "no" | null;
  tipo_operacion: "venta" | "alquiler";
}

const toolNodo = async (state: typeof newState.State) => {
  const { messages } = state;

  const lastMessage = messages[messages.length - 1] as AIMessage;
  console.log("toolNodo");
  console.log("-----------------------");
  // console.log(lastMessage);
  // console.log(lastMessage?.tool_calls);

  let toolMessage: BaseMessageLike = "un tool message" as BaseMessageLike;
  if (lastMessage?.tool_calls?.length) {
    const toolName = lastMessage.tool_calls[0].name;
    const toolArgs = lastMessage.tool_calls[0].args as pisosToolArgs & {
      query: string;
    } & { startTime: string; endTime: string } & {
      name: string;
      start: string;
      email: string;
    };
    let tool_call_id = lastMessage.tool_calls[0].id as string;

    if (toolName === "Obtener_pisos_en_venta_dos") {
      const responseInterrupt = humanNode(lastMessage);
      if (
        responseInterrupt.humanResponse &&
        typeof responseInterrupt.humanResponse !== "string" &&
        responseInterrupt.humanResponse.args
      ) {
        const toolArgsInterrupt = responseInterrupt.humanResponse
          .args as pisosToolArgs;
        const response = await getPisos2.invoke(toolArgsInterrupt);
        if (typeof response !== "string") {
          toolMessage = new ToolMessage(
            "Hubo un problema al consultar las propiedades intentemoslo nuevamente",
            tool_call_id,
            "Obtener_pisos_en_venta_dos",
          );
        } else {
          toolMessage = new ToolMessage(
            response,
            tool_call_id,
            "Obtener_pisos_en_venta_dos",
          );
        }
      }
    } else if (toolName === "universal_info_2025") {
      const res = await pdfTool.invoke(toolArgs);
      toolMessage = new ToolMessage(res, tool_call_id, "universal_info_2025");
    } else if (toolName === "get_availability_Tool") {
      const res = await getAvailabilityTool.invoke(toolArgs);
      toolMessage = new ToolMessage(res, tool_call_id, "get_availability_Tool");
    } else if (toolName === "create_booking_tool") {
      const res = await createbookingTool.invoke(toolArgs);
      toolMessage = new ToolMessage(res, tool_call_id, "create_booking_tool");
    } else if (toolName === "products_finder") {
      const res = await productsFinder.invoke({
        ...toolArgs,
        props: INMUEBLE_PROPS,
      } as any);
      toolMessage = new ToolMessage(res, tool_call_id, "products_finder");
    }
  } else {
    return { messages };
  }
  // tools.forEach((tool) => {
  //   if (tool.name === toolName) {
  //     tool.invoke(lastMessage?.tool_calls?[0]['args']);
  //   }
  // });
  // console.log("toolMessage: ", toolMessage);

  return { messages: [...messages, toolMessage] };
};

// const delete_messages = async (state: typeof newState.State) => {
//   const { messages, summary } = state;
//   console.log("delete_messages");
//   console.log("-----------------------");

//   console.log(messages);

//   let summary_text = "";

//   let messages_parsed: any[] = [];
//   messages_parsed = messages.map((message) => {
//     if (message instanceof AIMessage) {
//       return {
//         ...messages_parsed,
//         role: "assistant",
//         content: message.content,
//       };
//     }
//     if (message instanceof HumanMessage) {
//       return { ...messages_parsed, role: "Human", content: message.content };
//     }
//   });

//   // 1. Filtrar elementos undefined
//   const filteredMessages = messages_parsed.filter(
//     (message) => message !== undefined
//   );

//   // 2. Formatear cada objeto
//   const formattedMessages = filteredMessages.map(
//     (message) => `${message.role}: ${message.content}`
//   );

//   // 3. Unir las cadenas con un salto de línea
//   const prompt_to_messages = formattedMessages.join("\n");

//   if (messages.length > 3) {
//     if (!summary) {
//       const intructions_summary = `Como asistente de inteligencia artificial, tu tarea es resumir los siguientes mensajes para mantener el contexto de la conversación. Por favor, analiza cada mensaje y elabora un resumen conciso que capture la esencia de la información proporcionada, asegurándote de preservar el flujo y coherencia del diálogo
//         mensajes: ${prompt_to_messages}
//         `;

//       const summary_message = await model.invoke(intructions_summary);
//       summary_text = summary_message.content as string;
//     } else {
//       const instructions_with_summary = `"Como asistente de inteligencia artificial, tu tarea es resumir los siguientes mensajes para mantener el contexto de la conversación y además tener en cuenta el resumen previo de dicha conversación. Por favor, analiza cada mensaje y el resumen y elabora un nuevo resumen conciso que capture la esencia de la información proporcionada, asegurándote de preservar el flujo y coherencia del diálogo.

//       mensajes: ${prompt_to_messages}

//       resumen previo: ${summary}

//       `;

//       const summary_message = await model.invoke(instructions_with_summary);

//       summary_text = summary_message.content as string;
//     }

//     const mssageReduced = messages.slice(0, -3).map((message) => {
//       return new RemoveMessage({ id: message.id as string });
//     });

//     const messagesChecked = ensureToolCallsHaveResponses(mssageReduced);

//     return {
//       messages: [...messagesChecked],
//       summary: summary_text,
//     };
//   }
//   return { messages };
// };

const graph = new StateGraph(newState);

graph
  .addNode("agent", callModel)
  .addNode("tools", toolNodo)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

const checkpointer = new MemorySaver();

export const workflow = graph.compile({ checkpointer });
// let config = { configurable: { thread_id: "123" } };

// const response = await workflow.invoke({messages:"dame las noticias ams relevantes de este 2025"}, config)

// console.log("response: ", response);

// const response =  workflow.streamEvents({messages: [new HumanMessage("Hola como estas? ")]}, {configurable: {thread_id: "1563"} , version: "v2" });
// console.log("-----------------------");
// console.log("response: ", response);

// await workflow.stream({messages: [new HumanMessage("Podes consultar mi cobertura?")]}, {configurable: {thread_id: "1563"} , streamMode: "messages" });

// console.log("-----------------------");

// await workflow.stream({messages: [new HumanMessage("Mi dni es 32999482, tipo dni")]}, {configurable: {thread_id: "1563"} , streamMode: "messages" });

// for await (const message of response) {

//   // console.log(message);
//   // console.log(message.content);
//   // console.log(message.tool_calls);

//   console.dir({
//     event: message.event,
//     messages: message.data,

//   },{
//     depth: 3,
//   });
// }

// for await (const message of response) {
//   // console.log(message);

//   console.dir(message, {depth: null});
// }

// await workflow.stream(new Command({resume: true}));

// Implementacion langgraph studio sin checkpointer
// export const workflow = graph.compile();

// MODIFICAR EL TEMA DE HORARIOS
// En el calendar de cal esta configurado el horario de bs.as.
// El agente detecta 3hs mas tarde de lo que es en realidad es.
// Ejemplo: si el agente detecta 16hs, en realidad es 13hs.
// Para solucionar este problema, se debe modificar el horario de la herramienta "create_booking_tool".
// En la herramienta "create_booking_tool" se debe modificar el horario de la variable "start".
// En la variable "start" se debe modificar la hora de la reserva.
