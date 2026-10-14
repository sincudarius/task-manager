import type { Route } from "./+types/home";
import { Board } from "../features/board";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Task Manager" },
    { name: "description", content: "A calm sage-themed task manager." },
  ];
}

export default function Home() {
  return <Board />;
}
