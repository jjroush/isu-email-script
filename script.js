import fs from "fs";

import got from "got";
import _cliProgress from "cli-progress";

const main = async () => {
  const progressBar = new _cliProgress.SingleBar(
    {},
    _cliProgress.Presets.shades_classic
  );

  let data;

  try {
    data = fs.readFileSync(process.argv[2], "utf8");
  } catch (err) {
    console.error(err);
  }

  let outputFile = fs.createWriteStream(process.argv[3]);

  const strings = data.split("\n");

  progressBar.start(strings.length, 0);

  let unavailableNetIds = [];

  for (const [i, string] of strings.entries()) {
    if (string.charAt(0) === "S") {
      continue;
    }

    const netId = string.substring(5);

    try {
      const { body } = await got(
        `https://www.info.iastate.edu/individuals/search/${netId}@iastate.edu`
      );
      if (body.includes("<title>Individual Search Results")) {
        outputFile.write(netId + "\n", "utf8");
        unavailableNetIds.push(netId);
      }
    } catch (err) {
      console.log(err);
    }

    progressBar.update(i);
  }

  outputFile.end();
  progressBar.stop();

  console.log(unavailableNetIds.length + " emails are inactive");
};

main();
