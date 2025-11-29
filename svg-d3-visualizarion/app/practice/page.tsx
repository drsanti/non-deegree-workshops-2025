"use client";
import SignalPlot from "./components/SignalPlot";
import {
  generateSquareWave,
  generateSineWave,
  generateSawtoothWave,
  generateTriangleWave,
  generatePulseWave,
  generateGaussianNoise,
  generateUniformNoise,
  generatePinkNoise,
  generateBrownNoise,
  addNoiseToSignalByType,
} from "./lib/SignalGenerator";

// Signal Generation Practices
export const Practice1 = () => {
  const dataPoints = generateSquareWave(100, 4);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Square Wave</h2>
      <SignalPlot data={dataPoints} curveType="step" />
    </div>
  );
};

export const Practice2 = () => {
  const dataPoints = generateSineWave(100, 4);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Sine Wave</h2>
      <SignalPlot data={dataPoints} curveType="monotone" />
    </div>
  );
};

export const Practice3 = () => {
  const dataPoints = generateSawtoothWave(100, 4);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Sawtooth Wave</h2>
      <SignalPlot data={dataPoints} curveType="linear" />
    </div>
  );
};

export const Practice4 = () => {
  const dataPoints = generateTriangleWave(100, 4);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Triangle Wave</h2>
      <SignalPlot data={dataPoints} curveType="linear" />
    </div>
  );
};

export const Practice5 = () => {
  const dataPoints = generatePulseWave(100, 4, 1, 0.3);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Pulse Wave (30% Duty Cycle)
      </h2>
      <SignalPlot data={dataPoints} curveType="step" />
    </div>
  );
};

// Noise Generation Practices
export const Practice6 = () => {
  const dataPoints = generateGaussianNoise(100, 0, 0.5);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Gaussian Noise (White Noise)
      </h2>
      <SignalPlot data={dataPoints} curveType="linear" />
    </div>
  );
};

export const Practice7 = () => {
  const dataPoints = generateUniformNoise(100, -1, 1);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Uniform Noise</h2>
      <SignalPlot data={dataPoints} curveType="linear" />
    </div>
  );
};

export const Practice8 = () => {
  const dataPoints = generatePinkNoise(100, 0.5);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Pink Noise (1/f Noise)</h2>
      <SignalPlot data={dataPoints} curveType="monotone" />
    </div>
  );
};

export const Practice9 = () => {
  const dataPoints = generateBrownNoise(100, 0.5);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Brown Noise (1/f² Noise)</h2>
      <SignalPlot data={dataPoints} curveType="monotone" />
    </div>
  );
};

// Signal + Noise Practices
export const Practice10 = () => {
  const cleanSignal = generateSineWave(100, 4);
  const noisySignal = addNoiseToSignalByType(cleanSignal, "gaussian", 0.2);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Sine Wave + Gaussian Noise
      </h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Clean Signal</h3>
          <SignalPlot data={cleanSignal} curveType="monotone" color="#3b82f6" />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Noisy Signal</h3>
          <SignalPlot data={noisySignal} curveType="monotone" color="#ef4444" />
        </div>
      </div>
    </div>
  );
};

export const Practice11 = () => {
  const cleanSignal = generateSquareWave(100, 4);
  const noisySignal = addNoiseToSignalByType(cleanSignal, "uniform", 0.3);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Square Wave + Uniform Noise
      </h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Clean Signal</h3>
          <SignalPlot data={cleanSignal} curveType="step" color="#3b82f6" />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Noisy Signal</h3>
          <SignalPlot data={noisySignal} curveType="step" color="#ef4444" />
        </div>
      </div>
    </div>
  );
};

export const Practice12 = () => {
  const cleanSignal = generateSineWave(100, 4);
  const noisySignal = addNoiseToSignalByType(cleanSignal, "pink", 0.15);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Sine Wave + Pink Noise</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Clean Signal</h3>
          <SignalPlot data={cleanSignal} curveType="monotone" color="#3b82f6" />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Noisy Signal</h3>
          <SignalPlot data={noisySignal} curveType="monotone" color="#10b981" />
        </div>
      </div>
    </div>
  );
};

export const Practice13 = () => {
  const cleanSignal = generateSawtoothWave(100, 4);
  const noisySignal = addNoiseToSignalByType(cleanSignal, "brown", 0.2);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        Sawtooth Wave + Brown Noise
      </h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Clean Signal</h3>
          <SignalPlot data={cleanSignal} curveType="linear" color="#3b82f6" />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Noisy Signal</h3>
          <SignalPlot data={noisySignal} curveType="linear" color="#f59e0b" />
        </div>
      </div>
    </div>
  );
};

export default function Practice() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            Signal Generation Practice
          </h1>
          <p className="text-muted-foreground mt-2">
            Demonstrating all signal and noise generation functions
          </p>
        </header>

        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-bold mb-6">Signal Types</h2>
            <div className="space-y-8">
              <div className="bg-card rounded-lg border p-6">
                <Practice1 />
              </div>
              <div className="bg-card rounded-lg border p-6">
                <Practice2 />
              </div>
              <div className="bg-card rounded-lg border p-6">
                <Practice3 />
              </div>
              <div className="bg-card rounded-lg border p-6">
                <Practice4 />
              </div>
              <div className="bg-card rounded-lg border p-6">
                <Practice5 />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6">Noise Types</h2>
            <div className="space-y-8">
              <div className="bg-card rounded-lg border p-6">
                <Practice6 />
              </div>
              <div className="bg-card rounded-lg border p-6">
                <Practice7 />
              </div>
              <div className="bg-card rounded-lg border p-6">
                <Practice8 />
              </div>
              <div className="bg-card rounded-lg border p-6">
                <Practice9 />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6">Signal + Noise</h2>
            <div className="space-y-8">
              <div className="bg-card rounded-lg border p-6">
                <Practice10 />
              </div>
              <div className="bg-card rounded-lg border p-6">
                <Practice11 />
              </div>
              <div className="bg-card rounded-lg border p-6">
                <Practice12 />
              </div>
              <div className="bg-card rounded-lg border p-6">
                <Practice13 />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
