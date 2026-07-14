export type CircuitElementKind =
  | "resistor"
  | "capacitor"
  | "inductor"
  | "diode"
  | "transistor"
  | "op-amp"
  | "logic-gate"
  | "microcontroller"
  | "sensor"
  | "actuator"
  | "power-source"
  | "ground"
  | "connector"
  | "unknown";

export type CircuitElement = {
  id: string;
  kind: CircuitElementKind;
  value?: string;
  pins?: string[];
  metadata?: Record<string, unknown>;
};

export type CircuitConnection = {
  from: string;
  to: string;
  net?: string;
};

export type CircuitReadInput = {
  elements: CircuitElement[];
  connections: CircuitConnection[];
  labels?: string[];
  sourceDescription: string;
};

export type PolytopeDefinition = {
  id: string;
  dimensions: number;
  vertices?: number[][];
  faces?: number[][];
  cells?: number[][];
  labels?: string[];
};

export type PolyrhythmVoice = {
  id: string;
  pulses: number;
  steps: number;
  phase?: number;
  accentPattern?: number[];
};

export type PolyphonicVoice = {
  id: string;
  language?: string;
  pitchSource?: string;
  rhythmSource?: string;
  semanticRole?: string;
};

function uniqueIds(items: Array<{ id: string }>, label: string) {
  const seen = new Set<string>();
  for (const item of items) {
    const id = item.id.trim();
    if (!id) throw new Error(`${label} id is required.`);
    if (seen.has(id)) throw new Error(`Duplicate ${label} id: ${id}`);
    seen.add(id);
  }
}

export function createPolystructurePlan(input: {
  bankId: string;
  circuit?: CircuitReadInput;
  polytopes?: PolytopeDefinition[];
  polyrhythms?: PolyrhythmVoice[];
  polyphony?: PolyphonicVoice[];
  confirmation: string;
}) {
  const bankId = input.bankId.trim();
  if (!bankId) throw new Error("bankId is required.");
  const expectedConfirmation = `BUILD POLYSTRUCTURE BANK ${bankId}`;
  if (input.confirmation.trim() !== expectedConfirmation) {
    throw new Error(`Exact confirmation required: ${expectedConfirmation}`);
  }

  const circuit = input.circuit;
  if (circuit) {
    uniqueIds(circuit.elements, "circuit element");
    const elementIds = new Set(circuit.elements.map((element) => element.id));
    for (const connection of circuit.connections) {
      if (!elementIds.has(connection.from) || !elementIds.has(connection.to)) {
        throw new Error(`Circuit connection references an unknown element: ${connection.from} -> ${connection.to}`);
      }
    }
  }

  const polytopes = input.polytopes ?? [];
  const polyrhythms = input.polyrhythms ?? [];
  const polyphony = input.polyphony ?? [];
  uniqueIds(polytopes, "polytope");
  uniqueIds(polyrhythms, "polyrhythm voice");
  uniqueIds(polyphony, "polyphonic voice");

  for (const polytope of polytopes) {
    if (!Number.isInteger(polytope.dimensions) || polytope.dimensions < 1 || polytope.dimensions > 64) {
      throw new Error(`Polytope ${polytope.id} dimensions must be an integer from 1 to 64.`);
    }
  }

  for (const voice of polyrhythms) {
    if (!Number.isInteger(voice.pulses) || !Number.isInteger(voice.steps) || voice.pulses < 1 || voice.steps < 1) {
      throw new Error(`Polyrhythm ${voice.id} requires positive integer pulses and steps.`);
    }
  }

  return {
    schema: "jp-hviti-service-bridge-polystructure-bank/v1",
    createdAt: new Date().toISOString(),
    bank: {
      id: bankId,
      role: "reusable circuit, geometry, rhythm, and polyphonic pattern bank",
      mutableAutomatically: false,
      externalFinancialBank: false,
    },
    circuitry: {
      present: Boolean(circuit),
      sourceDescription: circuit?.sourceDescription ?? null,
      elementCount: circuit?.elements.length ?? 0,
      connectionCount: circuit?.connections.length ?? 0,
      circuitRead: circuit
        ? {
            elements: circuit.elements,
            connections: circuit.connections,
            labels: circuit.labels ?? [],
            inferredNets: Array.from(new Set(circuit.connections.map((connection) => connection.net).filter(Boolean))),
            electricalSimulationPerformed: false,
            energized: false,
          }
        : null,
    },
    polytopes: {
      count: polytopes.length,
      definitions: polytopes,
      supportsHigherDimensions: true,
      geometryRendered: false,
    },
    polyrhythms: {
      voiceCount: polyrhythms.length,
      voices: polyrhythms.map((voice) => ({
        ...voice,
        phase: voice.phase ?? 0,
        cycleLength: voice.steps,
        density: voice.pulses / voice.steps,
      })),
      audioRendered: false,
    },
    polyphony: {
      voiceCount: polyphony.length,
      voices: polyphony,
      languageVoicesAllowed: true,
      codeVoicesAllowed: true,
      signalVoicesAllowed: true,
      audioRendered: false,
    },
    integration: {
      hyperLanguageCubeCompatible: true,
      signalFabricCompatible: true,
      modemCompatible: true,
      ARCompatible: true,
      VSharpCompatible: true,
      bioacousticsCompatible: true,
      cognitionMeshCompatible: true,
    },
    truthBoundary: {
      bankCreatedInMemory: true,
      circuitReadPlanned: Boolean(circuit),
      circuitPowered: false,
      audioGenerated: false,
      geometryRendered: false,
      externalActionCompleted: false,
    },
  };
}
