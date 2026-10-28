import Image from "next/image";
import Link from "next/link";

/**
 * Marca de la plataforma: los escudos de la UP y la FIEC, y el nombre.
 * Es la misma marca que la navbar del mockup del Avance 2.
 */
export function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Image
        src="/logo-up.png"
        alt="Universidad de Panamá"
        width={compacta ? 32 : 40}
        height={compacta ? 32 : 40}
        className="shrink-0"
        priority
      />
      <Image
        src="/logo-fiec.png"
        alt="Facultad de Informática, Electrónica y Comunicación"
        width={compacta ? 36 : 44}
        height={compacta ? 28 : 34}
        className="shrink-0"
        priority
      />
      <span className="hidden leading-none sm:block">
        <span className="block text-[17px] font-extrabold tracking-tight text-fiec-700">
          CodeStart <span className="text-fiec-600">FIEC</span>
        </span>
        <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
          Curso Propedéutico · Programación
        </span>
      </span>
    </Link>
  );
}
