'use client'

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, MapIcon, TextIcon } from "lucide-react";

export default function Dashboard() {
  const reserves = useQuery(api.reserves.listReserves);
  const createReserve = useMutation(api.reserves.createReserve);
  const generateUploadUrl = useMutation(api.reserves.generateUploadUrl);
  const uploadReserveImage = useMutation(api.reserves.uploadReserveImage);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [yearFounded, setYearFounded] = useState(0);
  const [flora, setFlora] = useState<string[]>([]);
  const [fauna, setFauna] = useState<string[]>([]);

  const handleAddFlora = (newFlora: string) => {
    setFlora((prev) => [...prev, newFlora]);
  };

  const handleAddFauna = (newFauna: string) => {
    setFauna((prev) => [...prev, newFauna]);
  };

  const handleAddReserve = async () => {
    if (!name || !description || !region || !mainImage) {
      toast.error("Пожалуйста, заполните все обязательные поля.");
      return;
    }

    try {
      // Step 1: Generate upload URL for main image
      const mainImageUploadUrl = await generateUploadUrl();

      // Step 2: Upload main image
      const mainImageId = await uploadImage(mainImage, mainImageUploadUrl);

      // Step 3: Generate upload URLs for additional images
      const additionalImageUrls = await Promise.all(additionalImages.map(async (image) => {
        const uploadUrl = await generateUploadUrl();
        const imageId = await uploadImage(image, uploadUrl);
        return imageId;
      }));

      // Step 4: Create reserve with storage IDs
      const reserveId = await createReserve({
        name,
        description,
        region,
        imageUrl: mainImageId ?? undefined,
        additionalImages: additionalImageUrls ?? [],
        yearFounded,
        flora,
        fauna,
      });

      if (!reserveId) {
        throw new Error("Не удалось создать заповедник");
      }

      // Upload main image
      await uploadReserveImage({ reserveId, fileId: mainImageId ?? "" });

      // Show success message
      toast.success("Заповедник успешно добавлен!");

      // Reset form
      setName("");
      setDescription("");
      setRegion("");
      setMainImage(null);
      setAdditionalImages([]);
    } catch (error) {
      toast.error(`Произошла ошибка при добавлении заповедника: ${(error as Error).message}`);
    }
  };

  const uploadImage = async (file: File, uploadUrl: string) => {
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    const { storageId } = await response.json();
    return storageId;
  };

  return (
    <div className="container w-1/2 mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <h1 className="text-3xl font-bold">Добавить заповедник</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); handleAddReserve(); }} className="space-y-4">
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Название</label>
              <div className="flex items-center">
                <TextIcon className="mr-2" />
                <Input type="text" placeholder="Введите название" value={name} onChange={(e) => setName(e.target.value)} required className="flex-1" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Описание</label>
              <div className="flex items-center">
                <TextIcon className="mr-2" />
                <Textarea placeholder="Введите описание" value={description} onChange={(e) => setDescription(e.target.value)} required className="flex-1" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Регион</label>
              <div className="flex items-center">
                <MapIcon className="mr-2" />
                <Input type="text" placeholder="Введите регион" value={region} onChange={(e) => setRegion(e.target.value)} required className="flex-1" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Год основания</label>
              <Input type="number" value={yearFounded} onChange={(e) => setYearFounded(Number(e.target.value))} className="flex-1" />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Флора</label>
              <Input type="text" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddFlora((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }} className="flex-1" placeholder="Добавьте флору и нажмите Enter" />
              <ul>
                {flora.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Фауна</label>
              <Input type="text" onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddFauna((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }} className="flex-1" placeholder="Добавьте фауну и нажмите Enter" />
              <ul>
                {fauna.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Основное изображение</label>
              <div className="flex items-center">
                <ImageIcon className="mr-2" />
                <Input type="file" onChange={(e) => setMainImage(e.target.files ? e.target.files[0] : null)} required className="flex-1" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold">Дополнительные изображения</label>
              <div className="flex items-center">
                <ImageIcon className="mr-2" />
                <Input type="file" multiple onChange={(e) => setAdditionalImages(Array.from(e.target.files || []))} className="flex-1" />
              </div>
            </div>
            <Button type="submit" className="w-full">Добавить заповедник</Button>
          </form>
          <ul className="mt-4">
            {reserves?.map((reserve) => (
              <li key={reserve._id}>{reserve.name}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {/* Остальной контент панели управления */}
    </div>
  );
}
