import { Loading } from "@/components/common/Loading";

export default function LoadingPage() {
  return (
    <div className="container mx-auto py-8">
      <Loading lines={5} />
    </div>
  );
}
