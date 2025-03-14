"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Trash2, Plus, Upload, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Image from "next/image";

// Схема валидации формы
const reserveFormSchema = z.object({
  name: z.string().min(2, {
    message: "Название должно содержать минимум 2 символа",
  }),
  description: z.string().min(10, {
    message: "Описание должно содержать минимум 10 символов",
  }),
  region: z.string().min(2, {
    message: "Укажите регион",
  }),
  yearFounded: z.coerce
    .number()
    .min(1000, {
      message: "Введите корректный год основания",
    })
    .max(new Date().getFullYear(), {
      message: "Год не может быть в будущем",
    }),
  flora: z.array(z.string()).min(1, {
    message: "Добавьте хотя бы один вид флоры",
  }),
  fauna: z.array(z.string()).min(1, {
    message: "Добавьте хотя бы один вид фауны",
  }),
});

type ReserveFormValues = z.infer<typeof reserveFormSchema>;

const AddReserveForm = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [additionalImageUrls, setAdditionalImageUrls] = useState<string[]>([]);

  const generateUploadUrl = useMutation(api.reserves.generateUploadUrl);
  const createReserve = useMutation(api.reserves.createReserve);

  // Инициализация формы
  const form = useForm<ReserveFormValues>({
    resolver: zodResolver(reserveFormSchema),
    defaultValues: {
      name: "",
      description: "",
      region: "",
      yearFounded: new Date().getFullYear(),
      flora: [""],
      fauna: [""],
    },
  });

  // Обработка загрузки изображения
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isMainImage: boolean,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);

    try {
      const file = e.target.files[0];
      const uploadUrl = await generateUploadUrl();

      // Загрузка файла
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();

      if (isMainImage) {
        setMainImageId(storageId);
        // Создаем локальный URL для предпросмотра
        setMainImageUrl(URL.createObjectURL(file));
      } else {
        setAdditionalImageUrls([...additionalImageUrls, storageId]);
        setAdditionalImages([...additionalImages, URL.createObjectURL(file)]);
      }

      toast.success(
        isMainImage
          ? "Основное изображение загружено"
          : "Дополнительное изображение загружено",
      );
    } catch (error) {
      toast.error("Ошибка при загрузке изображения");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  // Добавление полей для флоры/фауны
  const addFieldItem = (fieldName: "flora" | "fauna") => {
    const currentValues = form.getValues()[fieldName];
    form.setValue(fieldName, [...currentValues, ""]);
  };

  // Удаление полей для флоры/фауны
  const removeFieldItem = (fieldName: "flora" | "fauna", index: number) => {
    const currentValues = form.getValues()[fieldName];
    if (currentValues.length <= 1) return;

    const newValues = currentValues.filter((_, i) => i !== index);
    form.setValue(fieldName, newValues);
  };

  // Удаление дополнительного изображения
  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
    setAdditionalImageUrls(additionalImageUrls.filter((_, i) => i !== index));
  };

  // Отправка формы
  const onSubmit = async (data: ReserveFormValues) => {
    if (!mainImageId) {
      toast.error("Загрузите основное изображение");
      return;
    }

    try {
      await createReserve({
        ...data,
        imageUrl: mainImageId,
        additionalImages:
          additionalImageUrls.length > 0 ? additionalImageUrls : undefined,
      });

      // Сброс формы
      form.reset();
      setMainImageUrl(null);
      setMainImageId(null);
      setAdditionalImages([]);
      setAdditionalImageUrls([]);

      toast.success("Заповедник успешно добавлен");
    } catch (error) {
      toast.error("Ошибка при добавлении заповедника");
      console.error(error);
    }
  };

  return (
    <div className="container max-w-3xl mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-950">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              Добавление нового заповедника
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">
              Заполните информацию о новом заповеднике
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Основная информация */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Введите название заповедника"
                            {...field}
                            className="focus-visible:ring-emerald-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Введите описание заповедника"
                            {...field}
                            rows={4}
                            className="resize-none focus-visible:ring-emerald-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Регион</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Введите регион"
                              {...field}
                              className="focus-visible:ring-emerald-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="yearFounded"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Год основания</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Год основания"
                              {...field}
                              className="focus-visible:ring-emerald-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Загрузка изображений */}
                <Accordion
                  type="single"
                  collapsible
                  defaultValue="images"
                  className="w-full"
                >
                  <AccordionItem value="images">
                    <AccordionTrigger className="font-medium text-gray-900 dark:text-gray-100">
                      Изображения
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2">
                      <div className="space-y-4">
                        <div>
                          <FormLabel className="block mb-2">
                            Основное изображение
                          </FormLabel>
                          <div className="flex flex-col items-center gap-4">
                            {mainImageUrl ? (
                              <div className="relative w-full h-40 rounded-lg overflow-hidden">
                                <Image
                                  src={mainImageUrl}
                                  alt="Основное изображение"
                                  className="w-full h-full object-cover"
                                  width={100}
                                  height={100}
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-90"
                                  onClick={() => {
                                    setMainImageUrl(null);
                                    setMainImageId(null);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="w-full">
                                <label
                                  className="flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                  aria-label="Загрузить основное изображение"
                                >
                                  <div className="flex flex-col items-center justify-center p-5">
                                    <Upload className="h-8 w-8 text-gray-500 dark:text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      Нажмите или перетащите файл
                                    </p>
                                  </div>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, true)}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <FormLabel className="block mb-2">
                            Дополнительные изображения
                          </FormLabel>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {additionalImages.map((url, index) => (
                              <div
                                key={index}
                                className="relative h-24 rounded-lg overflow-hidden"
                              >
                                <Image
                                  src={url}
                                  alt={`Дополнительное изображение ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  width={100}
                                  height={100}
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-90"
                                  onClick={() =>
                                    handleRemoveAdditionalImage(index)
                                  }
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}

                            <div>
                              <label
                                className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                aria-label="Загрузить дополнительное изображение"
                              >
                                <div className="flex flex-col items-center justify-center">
                                  <Plus className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                </div>
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, false)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Флора и фауна */}
                  <AccordionItem value="flora">
                    <AccordionTrigger className="font-medium text-gray-900 dark:text-gray-100">
                      Флора и фауна
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2">
                      <div className="space-y-6">
                        {/* Флора */}
                        <div className="space-y-2">
                          <FormLabel className="text-base">Флора</FormLabel>
                          {form.watch("flora").map((_, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <FormField
                                control={form.control}
                                name={`flora.${index}`}
                                render={({ field }) => (
                                  <FormItem className="flex-1 flex flex-col">
                                    <FormControl>
                                      <Input
                                        placeholder="Название вида"
                                        {...field}
                                        className="focus-visible:ring-emerald-500"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFieldItem("flora", index)}
                                className="h-10 w-10 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
                                aria-label="Удалить вид флоры"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addFieldItem("flora")}
                            className="mt-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:border-emerald-900 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
                          >
                            <Plus className="h-4 w-4 mr-2" /> Добавить вид
                          </Button>
                        </div>

                        {/* Фауна */}
                        <div className="space-y-2">
                          <FormLabel className="text-base">Фауна</FormLabel>
                          {form.watch("fauna").map((_, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <FormField
                                control={form.control}
                                name={`fauna.${index}`}
                                render={({ field }) => (
                                  <FormItem className="flex-1 flex flex-col">
                                    <FormControl>
                                      <Input
                                        placeholder="Название вида"
                                        {...field}
                                        className="focus-visible:ring-emerald-500"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFieldItem("fauna", index)}
                                className="h-10 w-10 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
                                aria-label="Удалить вид фауны"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addFieldItem("fauna")}
                            className="mt-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:border-emerald-900 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
                          >
                            <Plus className="h-4 w-4 mr-2" /> Добавить вид
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <CardFooter className="flex justify-end pt-4 px-0">
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isUploading}
                  >
                    {isUploading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Добавить заповедник
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AddReserveForm;
