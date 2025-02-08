import { pipeline, Transform, type TransformCallback } from "node:stream";
import build from "pino-abstract-transport";
import type { LoggerExtras } from "pino";

interface NumericLevelLine {
  level: number;
}

interface StringLevelLine {
  level: string;
}

const transformLogLevel = () =>
  build(
    (source: Transform & build.OnUnknown): Transform & build.OnUnknown => {
      const transform = new Transform({
        autoDestroy: true,
        objectMode: true,
        transform: (
          chunk: any, // eslint-disable-line @typescript-eslint/no-explicit-any
          encoding: BufferEncoding,
          callback: TransformCallback,
        ): void => {
          try {
            validateLogShape(chunk);
            validatePinoConfig(source);

            const newLevel = source.levels.labels[chunk.level] ?? "unknown";
            const newLine: StringLevelLine = Object.assign({}, chunk, {
              level: newLevel,
            });
            callback(null, JSON.stringify(newLine) + "\n");
          } catch {
            callback(null, JSON.stringify(chunk) + "\n");
          }
        },
      });

      pipeline(source, transform, () => {});
      return transform;
    },
    {
      enablePipelining: true,
      expectPinoConfig: true,
    },
  );

function validateLogShape(line: unknown): asserts line is NumericLevelLine {
  if (line == null) {
    throw new Error("line was null");
  }

  if (typeof line !== "object") {
    throw new Error("line was not an object");
  }

  if (!("level" in line)) {
    throw new Error("level key was not set in line object");
  }

  if (typeof line.level !== "number") {
    throw new Error("level was not numeric");
  }
}

function validatePinoConfig(
  source: Transform & build.OnUnknown,
): asserts source is Transform &
  build.OnUnknown &
  Pick<LoggerExtras, "levels"> {
  if (!("levels" in source)) {
    throw new Error("levels was not defined on source");
  }

  if (typeof source.levels !== "object") {
    throw new Error(
      `source.levels was type ${typeof source.levels}, not object`,
    );
  }

  if (source.levels == null) {
    throw new Error("source.levels was null");
  }

  if (!("labels" in source.levels)) {
    throw new Error("source.levels.labels was not defined");
  }
}

export default transformLogLevel;
