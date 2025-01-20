import HeroSection from "@/components/HeroSection";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import Image from "next/image";
import { v4 as uuid } from "uuid";

export default function Home() {
  return (
    <div className="Landing-Page flex flex-col items-center">
      {/* Hero Section  */}
      <HeroSection />

      {/* Stats  */}
      <section
        id="stats"
        className=" flex justify-around items-center w-full bg-blue-50 h-[260px] "
      >
        {statsData.map(({ value, label }, key) => {
          return (
            <div key={uuid()} className="text-center">
              <p className="font-bold text-4xl text-blue-700 pb-2">{value}</p>
              <p className="text-gray-500">{label}</p>
            </div>
          );
        })}
      </section>

      {/* Features   */}
      <section id="features" className="container  py-20   ">
        <h2 className="font-bold text-center text-4xl pb-12">
          Everything you need to manage your finances
        </h2>
        <div className="grid gap-8 px-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ">
          {featuresData.map(({ icon, title, description }, key) => (
            <Card key={uuid()} className="p-8 ">
              <CardContent className="flex flex-col gap-3">
                <p className="text-blue-500">{icon}</p>
                <p className="text-xl font-medium">{title}</p>
                <p className="text-gray-500">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works  */}
      <section className="howItWorks text-center py-20 bg-blue-50 w-full px-8  ">
        <h2 className="font-bold text-4xl pb-16">How It Works</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          {howItWorksData.map(({ icon, title, description }, key) => (
            <div
              key={uuid()}
              className="flex flex-col gap-4 items-center w-full md:w-1/2 lg:w-full"
            >
              <div className="rounded-full bg-blue-100 p-4">{icon}</div>
              <p className="font-medium text-xl">{title}</p>
              <p className="text-gray-600 ">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials  */}
      <section id="testimonials" className="container  py-20 px-8">
        <h2 className="font-bold text-4xl text-center pb-20">
          What Our Users Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {testimonialsData.map(({ name, role, image, quote }, key) => (
            <Card key={uuid()} className="p-4 text-gray-600">
              <CardHeader className="flex flex-row gap-4 ">
                <Image
                  src={image}
                  width={50}
                  height={50}
                  alt="image"
                  className="rounded-full"
                />
                <div>
                  <CardTitle>{name}</CardTitle>
                  <CardDescription>{role}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p>{quote}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action Btn  */}
      <section
        id="ctaBtn"
        className=" bg-blue-600 w-full text-center py-20 flex flex-col items-center gap-8"
      >
        <h2 className="text-white text-3xl font-bold">
          Ready to Take Control of Your Finances?
        </h2>
        <p className="text-white ">
          Join thousands of users who are already managing their finances
          smarter with FiNZA
        </p>
        <Button
          className="animate-bounce text-blue-600 bg-white w-fit px-8 py-5"
          variant="primary"
        >
          Start Free Trail
        </Button>
      </section>
    </div>
  );
}
