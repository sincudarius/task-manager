import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Task Manager" },
    { name: "description", content: "A calm sage-themed task manager." },
  ];
}

export default function Home() {
  return <Welcome />;
}
