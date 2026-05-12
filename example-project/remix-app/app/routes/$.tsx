import { useParams } from "@remix-run/react";
import { TestStage } from "react-test-components";
import type { TestComponent } from "react-test-components";

export default function TestComponentsPage() {
  const params = useParams();
  const name = (params["*"] ?? "") as TestComponent;

  return (
    <div>
      <TestStage name={name} />
    </div>
  );
}
