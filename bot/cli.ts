import { parseArgs } from "jsr:@std/cli/parse-args";

export const parseCLI = () => {
	const { code, help, players, report} = parseArgs(Deno.args, {
    string: ["code", "players"],
    boolean: ["help", "report"],
    default: {
      help: false,
      report: true
    },
    alias: { 
      "code": ["c"],
      "players": ["p"],
      "help": ["h"],
      "report": ["r"]
    }
  });

	return {
		code, help, players, report
	};
};

type PromptType = "string" | "number" | "boolean";
export async function cliPrompt<T>(prompt: string, type: PromptType, canBeEmpty: boolean = false): Promise<T> {
  await Deno.stdout.write(new TextEncoder().encode(prompt));
  const buff = new Uint8Array(100);
  const readBytes = await Deno.stdin.read(buff) as number | undefined;  
  
  if(!canBeEmpty && readBytes && readBytes <= 2) Deno.exit(1);

  if(type === "string"){
    if(canBeEmpty && readBytes! <= 2) return undefined as T;
    return new TextDecoder().decode(buff.subarray(0, readBytes)).trim() as T;
  }else if(type === "number"){
    return Number(new TextDecoder().decode(buff.subarray(0, readBytes))) as T;
  }else if(type === "boolean"){
    if(new TextDecoder().decode(buff.subarray(0, readBytes)).trim().toLowerCase() === "y")
      return true as T;
    else
      return false as T;
    
  }else{
    Deno.exit(1);
  }
}