import {
    Annotation,
    MemorySaver,
    MessagesAnnotation,
    StateGraph,
} from "@langchain/langgraph";
import { toolNode } from "./tools.mjs";

const StateAnnotation = MessagesAnnotation;
const GraphState = Annotation.Root({
  ...StateAnnotation.spec,
});
const graph = new StateGraph(GraphState);
graph
  .addNode("tools", toolNode)
  .addEdge("__start__", "tools")
  .addEdge("tools", "__end__");

const checkpointer = new MemorySaver();

export default graph.compile({ checkpointer });
