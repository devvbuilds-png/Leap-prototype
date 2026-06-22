"use client";

import { useState } from "react";
import { AppPhase, PathOption, ProfileData, RolesData, SimulationData } from "./types";
import LandingScreen from "./components/LandingScreen";
import OnboardingFlow from "./components/OnboardingFlow";
import PathsScreen from "./components/PathsScreen";
import SimulatorScreen from "./components/SimulatorScreen";
import RolesScreen from "./components/RolesScreen";
import NextStepsScreen from "./components/NextStepsScreen";

const EMPTY_PROFILE: ProfileData = {
  role: "",
  experience: "",
  aspiration: "",
  aspirationDetail: "",
  salary: "",
  collegeTier: "",
  cgpa: "",
  budget: "",
  countries: [],
  timeline: "",
};

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>("landing");
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [selectedPath, setSelectedPath] = useState<PathOption | null>(null);
  const [allPaths, setAllPaths] = useState<PathOption[]>([]);
  const [rolesData, setRolesData] = useState<RolesData | null>(null);
  const [simData, setSimData] = useState<SimulationData | null>(null);

  const handleOnboardingComplete = (data: ProfileData) => {
    setProfile(data);
    setPhase("paths");
  };

  const handleSelectPath = (path: PathOption, paths: PathOption[]) => {
    setSelectedPath(path);
    setAllPaths(paths);
    setRolesData(null);
    setSimData(null);
    setPhase("simulator");
  };

  const handleRestart = () => {
    setProfile(EMPTY_PROFILE);
    setSelectedPath(null);
    setAllPaths([]);
    setRolesData(null);
    setSimData(null);
    setPhase("landing");
  };

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col relative overflow-x-hidden">
        {phase === "landing" && (
          <LandingScreen onStart={() => setPhase("onboarding")} />
        )}

        {phase === "onboarding" && (
          <OnboardingFlow
            onComplete={handleOnboardingComplete}
            onBack={() => setPhase("landing")}
          />
        )}

        {phase === "paths" && (
          <PathsScreen
            profile={profile}
            onSelectPath={handleSelectPath}
            onBack={() => setPhase("onboarding")}
          />
        )}

        {phase === "simulator" && selectedPath && (
          <SimulatorScreen
            profile={profile}
            selectedPath={selectedPath}
            allPaths={allPaths}
            rolesData={rolesData}
            onRolesData={setRolesData}
            onSimData={setSimData}
            onBack={() => setPhase("paths")}
            onNext={() => setPhase("roles")}
          />
        )}

        {phase === "roles" && selectedPath && (
          <RolesScreen
            profile={profile}
            selectedPath={selectedPath}
            rolesData={rolesData}
            onRolesData={setRolesData}
            onBack={() => setPhase("simulator")}
            onNext={() => setPhase("nextsteps")}
          />
        )}

        {phase === "nextsteps" && selectedPath && (
          <NextStepsScreen
            profile={profile}
            selectedPath={selectedPath}
            simData={simData}
            onBack={() => setPhase("roles")}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
