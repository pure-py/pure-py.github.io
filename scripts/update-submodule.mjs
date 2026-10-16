import { execSync } from "node:child_process";

const submodule = "pure-py-spec";
const repository = "https://github.com/pure-py/pure-py-spec.git";

const run = (command) => {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit" });
};

const output = execSync(
  `git ls-remote --tags --refs --sort=-v:refname ${repository}`,
  { encoding: "utf8" },
);

const latestTag = output
  .split("\n")
  .find(Boolean)
  ?.split("refs/tags/")[1];

if (!latestTag) {
  throw new Error("No tags found in pure-py-spec repository.");
}

console.log(`Updating ${submodule} to ${latestTag}`);

run(`git submodule update --init --depth 1`);
run(
  `git -C ${submodule} fetch origin tag ${latestTag} --no-tags`,
);
run(`git -C ${submodule} checkout ${latestTag}`);

console.log(`Updated ${submodule} to ${latestTag}`);
