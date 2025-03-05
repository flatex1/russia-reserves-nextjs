"use client";

import { useEffect } from "react";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { ReservesGrid } from "./reserves-grid";

interface Reserve {
  _id: string;
  name: string;
  description: string;
  region: string;
  yearFounded: number;
  flora: string[];
  fauna: string[];
  imageUrl?: string;
}

export const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [regions, setRegions] = useState<string[]>([]);
  const [filteredReserves, setFilteredReserves] = useState<Reserve[]>([]);

  // Получаем регионы из базы данных
  const uniqueRegions = useQuery(api.reserves.getUniqueRegions);
  useEffect(() => {
    if (uniqueRegions) {
      setRegions(uniqueRegions);
    }
  }, [uniqueRegions]);

  // Логика фильтрации заповедников
  const reserves = useQuery(api.reserves.listReserves);
  useEffect(() => {
    if (reserves) {
      const filtered = reserves.filter((reserve: Reserve) => {
        const matchesName = reserve.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRegion = region === "all" || reserve.region === region;
        return matchesName && matchesRegion;
      });
      setFilteredReserves(filtered);
    }
  }, [searchQuery, region, reserves]);

  const sortOptions = [
    { value: "name", label: "Название" },
    { value: "dateAdded", label: "Дата добавления" },
  ];

  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-2xl font-semibold">Найти заповедники</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите регион" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>{region}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Сортировать по" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Отображение отфильтрованных заповедников */}
      <ReservesGrid reserves={filteredReserves} />
    </div>
  );
};