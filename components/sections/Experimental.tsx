"use client";

import SectionHeader from "@/components/ui/SectionHeader";
import NeuralLab from "@/components/experiments/NeuralLab";
import AgentLab from "@/components/experiments/AgentLab";
import FlowLab from "@/components/experiments/FlowLab";
import LabCounter from "@/components/experiments/LabCounter";
import { EXPERIMENTS } from "@/lib/content";
import { useLanguage } from "@/lib/i18n";

const code = (id: (typeof EXPERIMENTS)[number]["id"]) => EXPERIMENTS.find((e) => e.id === id)?.code ?? "";

/**
 * 02 · Laboratorio IA. Tres modelos escritos a mano que aprenden y
 * trabajan en el navegador del visitante: una red neuronal, un agente
 * de aprendizaje por refuerzo y una automatización con un clasificador.
 */
export default function Experimental() {
  const { t } = useLanguage();

  return (
    <section id="lab" data-theme="dark" aria-labelledby="lab-title" className="relative overflow-clip pb-20 md:pb-32">
      <SectionHeader num="02" title={t("exp.title")} label={t("exp.label")} meta={t("exp.meta")} id="lab-title" />

      <div className="mt-12 grid grid-cols-1 px-4 sm:px-8 md:mt-16 md:grid-cols-12 lg:px-12">
        <div className="md:col-span-7 lg:col-span-6">
          <p className="text-xl leading-snug md:text-2xl">{t("exp.intro")}</p>
          {/* Contador en vivo: suma los pasos de entrenamiento de los modelos. */}
          <p className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-mono text-[clamp(2.2rem,4.4vw,4rem)] font-medium leading-none tracking-[-0.04em] text-accent tabular-nums">
              <LabCounter />
            </span>
            <span className="label-mono text-muted">{t("exp.counter")}</span>
          </p>
        </div>
      </div>

      <div className="mt-12 border-t border-line md:mt-16">
        <NeuralLab code={code("net")} />
        <div className="grid grid-cols-1 md:grid-cols-12">
          <AgentLab code={code("agent")} />
          <FlowLab code={code("flow")} />
        </div>
      </div>
    </section>
  );
}
