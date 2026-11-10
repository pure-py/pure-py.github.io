import { execSync } from "node:child_process";

const SPEC = {
  name: "pure-py-spec",
  path: "pure-py-spec",
  url: "https://github.com/pure-py/pure-py-spec.git",
};

const CHECKER = {
  name: "isabelle-purepy",
  path: "isabelle-purepy",
  url: "https://github.com/pure-py/isabelle-purepy.git",
};

const run = (command) => {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit" });
};

const update_submodule = ({ name, path, url }) => {
  const output = execSync(
    `git ls-remote --tags --refs --sort=-v:refname ${url}`,
    { encoding: "utf8" },
  );

  const latestTag = output.split("\n").find(Boolean)?.split("refs/tags/")[1];

  if (!latestTag) {
    throw new Error("No tags found in pure-py-spec repository.");
  }

  console.log(`Updating ${name} to ${latestTag}`);

  run(`git submodule update --init --depth 1`);
  run(`git -C ${path} fetch origin tag ${latestTag} --no-tags`);
  run(`git -C ${path} checkout ${latestTag}`);

  console.log(`Updated ${name} to ${latestTag}`);
};

update_submodule(SPEC);
update_submodule(CHECKER);
