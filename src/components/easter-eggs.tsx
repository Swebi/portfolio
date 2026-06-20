import { getPersonal } from "@/lib/notion";
import { InteractiveTerminal } from "@/components/terminal";
import { CommandPalette } from "@/components/command-palette";

export async function EasterEggs() {
  const personal = await getPersonal();
  return (
    <>
      <InteractiveTerminal
        name={personal.name}
        github={personal.github}
        linkedin={personal.linkedin}
        resume={personal.resume}
        email={personal.email}
      />
      <CommandPalette
        github={personal.github}
        linkedin={personal.linkedin}
        resume={personal.resume}
        email={personal.email}
        twitter={personal.twitter}
        instagram={personal.instagram}
        youtube={personal.youtube}
      />
    </>
  );
}
