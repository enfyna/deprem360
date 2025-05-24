import { Button } from "@/components/ui/button";
import { Duyurular } from "@/components/ui/Duyurular";

export default function Home() {
    return (
        <main className="flex flex-row gap-8 row-start-2 items-center sm:items-start">
            <div className="flex-grow flex flex-col justify-center">
                <Button className="m-12">Bir button</Button>
                <Button className="m-12">Bir button</Button>
                <Button className="m-12">Bir button</Button>
                <Button className="m-12">Bir button</Button>
                <Button className="m-12">Bir button</Button>
                <Button className="m-12">Bir button</Button>
            </div>
            <Duyurular></Duyurular>
        </main>
    );
}
