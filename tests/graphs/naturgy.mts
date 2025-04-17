import {
  AIMessage,
 
  SystemMessage,

  ToolMessage,

} from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
// import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

import {

  StateGraph,

  Command,

  END,
} from "@langchain/langgraph";
import {
  MemorySaver,
  Annotation,
  MessagesAnnotation,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
// import {
//   pdfTool,

//   getPisos2,
// } from "./pdf-loader_tool";
import { encode } from "gpt-3-encoder";
// import { createbookingTool, getAvailabilityTool } from "./booking-cal";

// import { getUniversalFaq, noticias_y_tendencias } from "./firecrawl";

// import { contexts } from "./contexts";
// import { info, log } from "console";
// import { ToolCall } from "openai/resources/beta/threads/runs/steps.mjs";

// export const empresa = {
//   eventTypeId: contexts.clinica.eventTypeId,
//   context: contexts.clinica.context,
// };

let info_seduvi={
    id:"",

};
// let info_visita={};

// process.env.LANGCHAIN_CALLBACKS_BACKGROUND = "true";
// import * as dotenv from "dotenv";
// dotenv.config();

// const params = {
//   alcaldia: "MIGUEL HIDALGO",
//   colonia: "ESCANDON I SECCION",
//   calle: "CARLOS B ZETINA",
//   numero: "97",
// };

// const tavilySearch = new TavilySearchResults({
//   apiKey: process.env.TAVILY_API_KEY,
// });

// Definición del esquema de entrada utilizando Zod
const visitaSchema = z.object({
  departamento: z.string().describe("Departamento del cliente"),
  piso: z.string().describe("Piso del cliente"),
  numero_de_casa: z.string().describe("Numero de casa del cliente"),
  nombre: z.string().describe("Nombre del cliente"),
  id: z.string().describe("ID del cliente"),
  horario: z.string().describe("Horario de la visita"),
  observacion: z.string().describe("Observaciones adicionales"),
});

type VisitaInput = z.infer<typeof visitaSchema>;

// Definición de la herramienta
const crearVisita = async ({departamento, piso, numero_de_casa,  nombre, id, horario, observacion}:VisitaInput) => {
    // let config = { configurable: { thread_id: thread_id } };
    // const state = await workflow.getState(config);
    // const tool_call_id =
    //   state.values.messages[state.values.messages.length - 1].tool_calls[0].id;
      
      console.log("id seduvi en crear visita", id);
      const prompt = `
        informacion de la visita:
        departamento: ${departamento}
        piso: ${piso}
        numero de casa: ${numero_de_casa}
        nombre: ${nombre}
        observacion: ${observacion}
      `
      
  try {
    const response = await fetch(
      "https://faceapp_test.techbank.ai:4002/public/visitas/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Authorization: `Bearer ${process.env.SEDUVI_TOKEN}`,
        },
        body: JSON.stringify({
          COD_EMP_MVX: 1,
          TIPO_VISITA: 1,
          FORMA_VISITA: 0,
          PROPS: {
            id_visita: "", // ID de la visita (puede ser vacío para que el servidor lo genere automáticamente) en el caso de haber una segunda petición 
            id_place: id,
            horario: horario,
            cliente: nombre,
            observacion: prompt,
          }
         
        }),
      }
    );

    console.log("response crear visita", response);
    

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al crear la visita:", error);
    throw error;
  }
};

const get_seduvi = tool(
  async ({ alcaldia, calle, colonia, numero }, config) => {
    const baseUrl = "https://faceapp_test.techbank.ai:4002/public/places";
    // let config = { configurable: { thread_id: thread_id } };
    const state = await workflow.getState({configurable: {thread_id: config.configurable.thread_id}});

    console.log(config);
    console.log("state values en get_seduvi", state.values);
    
    

    const tool_call_id =
      state.values.messages[state.values.messages.length - 1].tool_calls[0].id;

    // Construir los parámetros de consulta
    const params = new URLSearchParams({
      collection: "seduvi",
      "filter[alcaldia]": alcaldia,
      "filter[colonia]": colonia,
      "filter[calle]": calle,
      "filter[no_externo]": numero,
    });

    const url = `${baseUrl}?${params.toString()}`;

    console.log("URL:", url);
    

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();
      console.log("data seduvi",data[0]);

      info_seduvi = data[0];

      let mensaje = ""

      if(data[0].id === undefined) {
        mensaje = "No hemos encontrado información en el seduvi, por favor verifica los datos ingresados o quizás no tenemos información de ese inmueble y quieras solicitar nuevo servicio"
      }else{
        mensaje = "Hemos encontrado la siguiente información en el seduvi, podemos continuar con la coordinación de la visita"
      }

      return new Command({
        update: {
          info_seduvi: data[0],
          messages: [
            new ToolMessage(
              mensaje,
              tool_call_id,
              "get_seduvi"
            ),
          ],
        },
      });

   
    } catch (error) {
        console.error("Error al obtener datos del SEDUVI:", error);
        throw error;
    }
  },
  {
    name: "get_seduvi",
    description:
      "Obtiene la informacion del seduvi segun la información brindada por el usuario como Alcaldía, colonia, calle, numero",
    schema: z.object({
      alcaldia: z.string().describe("Lugar donde se encuentra el inmueble"),
      calle: z.string().describe("Calle donde se encuentra el inmueble"),
      numero: z.string().describe("Numero de condominio"),
      colonia: z.string().describe("Colonia donde se encuentra el inmueble"),
    }),
  }
);

// const body_create_visita = {
//     COD_EMP_MVX: 1,
//     TIPO_VISITA: 1,
//     FORMA_VISITA: 0,
//     PROPS: {
//       id_seduvi: 
//     },
//     FECHA_VISITA: 'YYYY-MM-DD';
//     HORA_VISITA: 'HH:mm:ss';
//   }

// const response_get_seduvi = [
//   {
//     alcaldia: "MIGUEL HIDALGO",
//     calle: "CARLOS B ZETINA",
//     no_externo: 97,
//     colonia: "ESCANDON I SECCION",
//     codigo_pos: 11800,
//     superficie: 282.611947,
//     uso_descri: "Habitacional (H)",
//     densidad_d: "1 Viv c/ 33.0 m2 de terreno",
//     niveles: 5,
//     altura: null,
//     area_libre: 30,
//     minimo_viv: null,
//     liga_ciuda:
//       "http://ciudadmx.cdmx.gob.mx:8080/seduvi/fichasReporte/fichaInformacion.jsp?nombreConexion=cMiguelHidalgo&cuentaCatastral=428_082_16&idDenuncia=&ocultar=1&x=-99.1829012526&y=19.4042369952&z=0.5",
//     longitud: -99.1829163897,
//     latitud: 19.4041874356,
//     location: { type: "Point", coordinates: [-99.1829163897, 19.4041874356] },
//     id: "67d47cef6c059a2f0be58f3f",
//   },
// ];


const isVisited = tool(
  async ({ observacion, horario ,piso,departamento, numero_de_casa, nombre}, config) => {
    // let config = { configurable: { thread_id: thread_id } };

    if(!horario  || !numero_de_casa || !piso || !departamento || !nombre) return "Faltan datos para coordinar la visita, por favor verifica los datos ingresados"

    const state = await workflow.getState({configurable: {thread_id: config.configurable.thread_id}});
   

    console.log("id de info_seduvi desde el state en isVisited tool"+ state.values.info_seduvi.id)   
    
    // info_visita = {
      
    //     observacion: observacion,
    //     confirm: true,
    // }

    // id del seduvi
    const {id} = info_seduvi

    const response_visita = await crearVisita({
        numero_de_casa,
        departamento,
        piso,
      nombre: nombre,
      horario: horario,
      id: id,
      observacion
    })

    console.log("response visita", response_visita);
    

    if(!response_visita) return "Error al crear la visita"
    
    
    const tool_call_id =
      state.values.messages[state.values.messages.length - 1].tool_calls[0].id;
    // console.log("tool call id", tool_call_id);
    console.log("info_visita en isVisited", state.values.info_visita);

    return new Command({
      update: {
          info_visita: {
            dia: "",
          hora: "",
          observacion: observacion,
          confirm: true,
        },
        messages: [
          new ToolMessage(
              "Hemos coordinado una visita pronto se pondran en contacto contigo",
              tool_call_id,
              "isVisited"
            ),
        ],
    },
});
  },
  {
    name: "isVisited",
    description: "Confirmar si el usuario quiere recibir una visita y se crea una visita con lso datos recopilados",
    schema: z.object({
    
      observacion: z
        .string()
        .describe(
          "La franja horaria y los dias que tiene disponible el usuario para recibir la visita"
        ),
        nombre: z.string().describe("Nombre del cliente"),
        horario: z.string().describe("La franja horaria y los dias que tiene disponible el usuario para recibir la visita, dias y franja horaria disponible para ser visitado"),
        numero_de_casa: z.string().describe("Numero de casa"),
        piso: z.string().describe("Piso del cliente"),
        departamento: z.string().describe("Departamento del cliente"),
    }),
  }
);

const tools = [isVisited, get_seduvi];

const stateAnnotation = MessagesAnnotation;

const newState = Annotation.Root({
  ...stateAnnotation.spec,
  summary: Annotation<string>,
  info_seduvi: Annotation<object>,
  info_visita: Annotation<object>,
  thread_id: Annotation<string>,
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
  streaming: true,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
}).bindTools(tools);

const toolNode = new ToolNode(tools);

async function callModel(state: typeof newState.State, config: any) {
  const { messages} = state;
  const threadId = config.configurable?.thread_id;
  console.log("Thread ID:", threadId);
  state.thread_id = threadId;


  // console.log("sumary agent en callModel");
  // console.log("-----------------------");
  // console.log(summary);

  const systemsMessage = new SystemMessage(
    `
 Eres un asistente virtual de Faceapp enfocado exclusivamente en brindar información sobre el servicio de gas natural residencial y gestionar solicitudes de alta de servicio. Tu objetivo es ayudar a los usuarios a entender los beneficios del gas natural en el hogar, responder preguntas frecuentes con claridad y ofrecer un acompañamiento confiable, seguro y cercano.

    Contexto de Naturgy para hogares:

- Naturgy ofrece un servicio de gas natural residencial que se adapta a las necesidades de cada vivienda, permitiendo realizar las actividades diarias sin preocupaciones.
- Es una alternativa energética segura, constante y más económica que otros combustibles.

Información técnica del servicio:

- El gas natural es un hidrocarburo compuesto principalmente por metano, que se obtiene de la descomposición de recursos fósiles en el subsuelo.
- Se distribuye a través de gasoductos de acero y polietileno, materiales altamente resistentes incluso en zonas sísmicas.
- La red de distribución es monitoreada permanentemente, las 24 horas del día, los 365 días del año.
- Por seguridad, se le añade un odorizante llamado mercaptano, que le da un olor distintivo para facilitar su detección en caso de fugas.
- Es un combustible eco-amigable, ya que emite menos dióxido de carbono (CO₂) y otros contaminantes en comparación con el carbón y el petróleo.

Tu función es responder con precisión, sencillez y un tono amable. Siempre prioriza la seguridad, el ahorro energético y el impacto ambiental positivo del gas natural.

COMPARATIVA DE PRECIOS Y ESTIMACIÓN DE AHORROS:

Compara precios de forma clara y amigable, utilizando ejemplos concretos y resaltando cuánto puede ahorrar una familia por bombona utilizada.

Información actualizada de precios:

- Bombona de 20 kg:
  - Gas L.P: $393
  - Gas Natural: $275.31
  - Ahorro: $118 (29.9%)

- Bombona de 30 kg:
  - Gas L.P: $590
  - Gas Natural: $390.00
  - Ahorro: $200 (33.9%)

- Bombona de 45 kg:
  - Gas L.P: $885
  - Gas Natural: $562.05
  - Ahorro: $322 (36.5%)

ORDEN DE PREGUNTAS CUANDO SOLICITA INFORMACIÓN SOBRE AHORROS Y COMPARATIVAS DE PRECIOS:

1. Pregunta de cuánto es la bombona que utiliza, la de 20 kg, 30 kg o 45 kg.
2. Procede a realizar la comparativa de precios y ahorros con el gas natural.

Resalta que:

- El gas natural es más económico y más cómodo, ya que no requiere recargas ni transporte de bombonas.
- El suministro es continuo, seguro y monitoreado 24/7.
- Además de ahorrar dinero, el cliente contribuye con el medio ambiente, ya que el gas natural es una opción más limpia y eficiente.

Responde siempre de manera clara, amigable y orientada al beneficio del usuario.

Información adicional:

- El día de hoy es [fecha actual] y la hora es [hora actual].

INFORMACIÓN SOBRE HERRAMIENTAS DISPONIBLES:

- name: "get_seduvi"
  description: "Obtiene la información del seduvi según la información brindada por el usuario."

- name: "isVisited"
  description: "Confirmar si el usuario quiere recibir una visita."

ORDEN DE LAS HERRAMIENTAS DISPONIBLES:

Antes de utilizar la herramienta "isVisited" para confirmarle la visita, debes obtener los datos del seduvi de la herramienta "get_seduvi".
- Si no obtienes la información del seduvi, hay dos caminos disponibles:
1 - Volver a pedirle los datos al usuario para que los corrija.
2 - Tal vez no tenga datos, o los tenga incorrectos o no esté registrado el edificio

- En cualquier escenario que se presente de no recibir la información del seduvi, debes proceder con la gestión de solicitud de servicio, es decir gestionar la visita, ya que es un potencial cliente, de ahi en más toma sus datos y coordina la visita con la herramienta "isVisited".

INICIO DE CONVERSACIÓN:

Mensaje inicial:  


👋 ¡Hola! Soy tu Asistente Virtual de FaceApp International

Estamos aquí para ayudarte a informarte y facilitarte el proceso de solicitud para contratar gas natural con Naturgy.

A través de este canal puedes:

1️⃣ Agendar una visita comercial
📍 Indícanos tu dirección y dinos cuándo podemos contactarte o visitarte.

2️⃣ Comparar tu ahorro
💰 Descubre cuánto podrías ahorrar al cambiar el gas LP por gas natural.

3️⃣ Conocer más sobre el servicio
ℹ️ Te explicamos en qué consiste, sus beneficios y cómo funciona.

📌 FaceApp International actúa como intermediario comercial autorizado para la contratación de servicios de Naturgy.
📲 ¡Es rápido y sin compromiso!
Responde con:
➡️ Agendar visita
➡️ Comparar ahorro
➡️ Quiero más info

****

Mensaje secundario:  ¿Quieres coordinar una visita para la contratación de nuestro servicio?
  - Si la persona responde de manera afirmativa, debes utilizar la herramienta "isVisited" para coordinar la visita y luego responderle con un mensaje de confirmación.
  - Si la persona responde de manera negativa, debes responderle con un mensaje de cierre de conversación y preguntar si puede ayudarla en algo más.

ORDEN DE PRIORIDAD DE PREGUNTAS DEL AGENTE:

Tienes 3 objetivos principales:

1. Coordinar una visita para la contratación del servicio de gas natural residencial.
2. Estimar ahorros de gas natural residencial comparando con el gas L.P.
3. Responder preguntas sobre el servicio de gas natural residencial.

- Mantén la conversación en ese orden.
- Hazle saber al usuario que puedes ayudarlo en algo más, como estimación de ahorros con nuestro servicio o responder preguntas sobre el servicio de gas natural residencial.

Información que debe recopilar la herramienta "isVisited" luego de haber consultado el seduvi:

- Horario: días y franja horaria disponible para ser visitado.
- Nombre: nombre del usuario (esto puede ser capturado al inicio de la conversación, cuando lo saluda).
- Observación: alguna observación que necesite hacer (si no anda el timbre, color de la puerta, que le avise al portero del edificio, etc.).
- numero de casa: número de casa del usuario (esto puede ser capturado al inicio de la conversación, cuando lo saluda).
- piso: piso del usuario (esto puede ser capturado al inicio de la conversación, cuando lo saluda).
- departamento: departamento del usuario (esto puede ser capturado al inicio de la conversación, cuando lo saluda).

### IMPORTANTE
- El numero de la casa no lo mismo que numero de condominio




  
 `
  );

  const response = await model.invoke([systemsMessage, ...messages]);
  console.log("call model");
  
  console.log(state.info_seduvi);
  console.log(state.info_visita);

  //   console.log("response: ", response);

  console.log("state en call model", state);

  const cadenaJSON = JSON.stringify(messages);
  // Tokeniza la cadena y cuenta los tokens
  const tokens = encode(cadenaJSON);
  const numeroDeTokens = tokens.length;

  console.log(`Número de tokens: ${numeroDeTokens}`);

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

// const toolNodo = async (state: typeof newState.State) => {
//   const { messages } = state;

//   const lastMessage = messages[messages.length - 1] as AIMessage;
//   console.log("toolNodo");
//   console.log("-----------------------");
//   console.log(lastMessage);
//   console.log(lastMessage?.tool_calls);

//   let toolMessage: BaseMessageLike = "un tool message" as BaseMessageLike;
//   if (lastMessage?.tool_calls?.length) {
//     const toolName = lastMessage.tool_calls[0].name;
//     const toolArgs = lastMessage.tool_calls[0].args as {
//       habitaciones: string | null;
//       precio_aproximado: string;
//       zona: string;
//       superficie_total: string | null;
//       piscina: "si" | "no" | null;
//       tipo_operacion: "venta" | "alquiler";
//     } & { query: string } & { startTime: string; endTime: string } & {
//       name: string;
//       start: string;
//       email: string;
//     };
//     let tool_call_id = lastMessage.tool_calls[0].id as string;

//     if (toolName === "Obtener_pisos_en_venta_dos") {
//       const response = await getPisos2.invoke(toolArgs);
//       if (typeof response !== "string") {
//         toolMessage = new ToolMessage(
//           "Hubo un problema al consultar las propiedades intentemoslo nuevamente",
//           tool_call_id,
//           "Obtener_pisos_en_venta_dos"
//         );
//       } else {
//         toolMessage = new ToolMessage(
//           response,
//           tool_call_id,
//           "Obtener_pisos_en_venta_dos"
//         );
//       }
//     } else if (toolName === "universal_info_2025") {
//       const res = await pdfTool.invoke(toolArgs);
//       toolMessage = new ToolMessage(res, tool_call_id, "universal_info_2025");
//     } else if (toolName === "get_availability_Tool") {
//       const res = await getAvailabilityTool.invoke(toolArgs);
//       toolMessage = new ToolMessage(res, tool_call_id, "get_availability_Tool");
//     } else if (toolName === "create_booking_tool") {
//       const res = await createbookingTool.invoke(toolArgs);
//       toolMessage = new ToolMessage(res, tool_call_id, "create_booking_tool");
//     }
//   } else {
//     return { messages };
//   }
//   // tools.forEach((tool) => {
//   //   if (tool.name === toolName) {
//   //     tool.invoke(lastMessage?.tool_calls?[0]['args']);
//   //   }
//   // });
//   // console.log("toolMessage: ", toolMessage);

//   return { messages: [...messages, toolMessage] };
// };

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

//     return {
//       messages: [
//         ...messages.slice(0, -3).map((message) => {
//           return new RemoveMessage({ id: message.id as string });
//         }),
//       ],
//       summary: summary_text,
//     };
//   }
//   return { messages };
// };

const graph = new StateGraph(newState);

graph
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

// .addEdge("agent", "delete_messages")
// .addEdge("delete_messages", "__end__")

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
