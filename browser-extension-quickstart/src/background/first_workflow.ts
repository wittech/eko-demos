import { Eko } from "@eko-ai/eko";
import { EkoConfig, WorkflowCallback } from "@eko-ai/eko/types";
import { getLLMConfig } from "@eko-ai/eko/extension";

export async function main() {
  // Load LLM model configuration
  // the current browser plugin project provides a page for configuring LLM parameters
  let config = await getLLMConfig();
  if (!config || !config.apiKey) {
    printLog("Please configure apiKey", "error");
    return;
  }

  // Initialize eko
  let eko = new Eko(config as EkoConfig);

  // Generate a workflow from natural language description
  const workflow = await eko.generate(`
    Search Sam Altman's information and summarize it into markdown format for export
  `);

  // Execute the workflow
  await eko.execute(workflow, hookLogs());
}

function hookLogs(): WorkflowCallback {
  return {
    hooks: {
      beforeWorkflow: async (workflow) => {
        printLog("Start workflow: " + workflow.name);
      },
      beforeSubtask: async (subtask, context) => {
        printLog("> subtask: " + subtask.name);
      },
      beforeToolUse: async (tool, context, input) => {
        printLog("> tool: " + tool.name);
        return input;
      },
      afterToolUse: async (tool, context, result) => {
        printLog("  tool: " + tool.name + " completed", "success");
        return result;
      },
      afterSubtask: async (subtask, context, result) => {
        printLog("  subtask: " + subtask.name + " completed", "success");
        return result;
      },
      afterWorkflow: async (workflow, variables) => {
        printLog("Completed", "success");
      },
    },
  };
}

function printLog(log: string, level?: "info" | "success" | "error") {
  chrome.runtime.sendMessage({ type: "log", log, level: level || "info" });
}
