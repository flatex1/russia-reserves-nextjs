"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export type Reserve = {
  _id: string;
  name: string;
  description: string;
  region: string;
  imageUrl?: string;
  yearFounded: number;
  flora: string[];
  fauna: string[];
};

type ReservesGridProps = {
  reserves: Reserve[];
};

export const ReservesGrid = ({ reserves }: ReservesGridProps) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reserves.map((reserve) => (
        <Card key={reserve._id} className="overflow-hidden">
          <CardHeader className="p-0">
            <div className="relative h-48 w-full">
              <Image
                src={reserve.imageUrl ?? ''}
                alt={reserve.name}
                fill
                className="object-cover"
              />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{reserve.name}</h3>
              <Badge variant="secondary">{reserve.region}</Badge>
            </div>
            <p className="text-muted-foreground line-clamp-2">
              {reserve.description}
            </p>
            <p className="text-sm">Год основания: {reserve.yearFounded}</p>
            <p className="text-sm">Флора: {reserve.flora.join(", ")}</p>
            <p className="text-sm">Фауна: {reserve.fauna.join(", ")}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/reserves/${reserve._id}`)}
            >
              Узнать больше
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
