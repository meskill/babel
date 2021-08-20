import { join, dirname } from "path";
import { promises } from "fs";
import rimraf from "rimraf";
import { fileURLToPath } from "url";
import getTargets from "../..";

const currentDir = dirname(fileURLToPath(import.meta.url));
let mocked = [];

async function mock(name, exports) {
  const dir = join(
    fileURLToPath(import.meta.url),
    "..",
    "..",
    "..",
    "node_modules",
    name,
  );
  mocked.push(dir);
  await promises.mkdir(dir, { recursive: true });
  const content = "module.exports = " + JSON.stringify(exports);
  await promises.writeFile(join(dir, "index.js"), content);
}

afterEach(() => {
  mocked.map(dir => rimraf.sync(dir));
  mocked = [];
});

it("pass env to configs used with extends", async () => {
  await mock("@babel/browserslist-config", {
    custom: ["firefox >= 75"],
    defaults: ["chrome >= 5"],
  });
  const actual = getTargets(
    {},
    {
      configPath: currentDir,
      browserslistEnv: "custom",
    },
  );

  expect(actual).toEqual({ chrome: "71.0.0", firefox: "75.0.0" });
});
