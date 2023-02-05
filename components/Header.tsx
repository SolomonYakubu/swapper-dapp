import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import logo from "../public/images/logo.png";

import ExportedImage from "next-image-export-optimizer";
export default function Header({ connectToMetamask, connected }) {
  const list = [
    ["Home", "https://theswapper.tech/"],

    ["Docs", "https://the-swapper-project.gitbook.io/the-swapper/"],
  ];

  return (
    <div className="fixed top-0 z-40">
      <div
        className={`bg-white transition-all duration-500 p-4  md:px-16 md:py-8 flex w-screen items-center justify-between   h-16`}
      >
        <div className="block w-20 p-1">
          <ExportedImage
            src={logo}
            alt="logo"
            layout="responsive"
            className=""
          />
        </div>
        <ul className="  md:justify-between  md:flex ">
          {list.map(([name, link], index) => (
            <a
              className="m-2 text-black  text-xl cursor-pointer hover:text-blue-400 font-[Questrial]"
              key={index}
              href={`${link}`}
            >
              {name}
            </a>
          ))}
          <button
            onClick={() => connectToMetamask()}
            className="font-[Questrial]  hover:bg-gradient-to-tr hover:bg-primary bg-grad bg-gradient-to-bl from-black to-[#262626] font-bold  text-white shadow-xl p-3 px-2 rounded-xl mr-1 border-none  self-end  "
          >
            {connected ? "Connected" : "Connect Wallet"}
          </button>
        </ul>
      </div>
    </div>
  );
}
