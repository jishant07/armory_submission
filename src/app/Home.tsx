import { MainChart } from "@/components/chartComponent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { RocketIcon } from "lucide-react";

type PageProps = {
  data: {name : string, value: number}[], 
  setIsLoading: Function,
  granularity : number,
  sliderValue : number,
  handleSlider : Function
}

export default function Home({data, granularity, sliderValue, handleSlider} : PageProps) {

  return (
    <>
      <div className="pt-4 w-full">
          <div>
            <div className="flex justify-center items-center">
              {
              data.length ? 
              <div className="h-2/5 w-4/5">
                <MainChart 
                  data={data.slice(sliderValue, sliderValue + (5 * data.length / 10))} 
                  granularity={granularity}
                />
                <div className="m-10 text-center">
                  <Slider min={0} step={data.length / 10} max={data.length - 1} onValueChange={(e) => handleSlider(e[0])}/>
                </div>
              </div> 
              : 
              <Alert>
              <RocketIcon className="h-4 w-4" />
                <AlertTitle>Heads up!</AlertTitle>
                <AlertDescription>
                  Data not loaded in yet, please select a valid CSV using the browse button in the sidebar
                </AlertDescription>
              </Alert>
              }
            </div>
          </div>
        </div>
    </>
  );
}
