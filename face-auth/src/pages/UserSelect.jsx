import React, { useEffect, useState } from "react";
import User from "../components/User";
import { RadioGroup } from "@headlessui/react";
import { Link } from "react-router-dom";
import { API_BASE_URL, createCustomAccount, getAccounts } from "../api/client";

function UserSelect() {
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [customUser, setCustomUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAccounts()
      .then((data) => {
        setAccounts(data);
        if (data.length > 0) {
          setSelected(data[0]);
        }
      })
      .catch(() => {
        setErrorMessage("Failed to load accounts from server.");
      });
  }, []);

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        resolve(fileReader.result);
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-[24px] w-full max-w-[720px] mx-auto px-6">
      {/* <h1 className="text-2xl font-semibold">Select a Dummy User to Log In</h1> */}
      <div className="w-full p-4 flex flex-col items-center">
        <div className="mx-auto w-full max-w-2xl">
          <RadioGroup value={selected} onChange={setSelected}>
            <RadioGroup.Label className="sr-only">Server size</RadioGroup.Label>
            <div className="space-y-4">
              {/* {accounts.map((account) => (
                <User key={account.id} user={account} />
              ))} */}
              {customUser && (
                <div className="relative">
                  <User key={customUser.id} user={customUser} type="CUSTOM" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="text-white w-8 h-8 absolute top-1/2 -translate-y-1/2 right-[-40px] cursor-pointer hover:scale-110 transition-transform"
                    onClick={() => {
                      setCustomUser(null);
                      selected?.type === "CUSTOM" && setSelected(accounts[0]);
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              )}
            </div>
          </RadioGroup>
          {!customUser && (
            <div className="flex flex-col items-center justify-center w-full mt-6">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-80 border-2 border-white/30 border-dashed rounded-3xl cursor-pointer bg-white/10 backdrop-blur-md hover:bg-white/20 hover:border-white/50 transition-all duration-300 shadow-xl"
              >
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-16 h-16 text-white/80 mb-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                    />
                  </svg>
                  <p className="font-semibold mb-2 text-xl text-gray-900">
                    Click to upload your photo
                  </p>
                  <p className="text-sm text-gray-700">
                    PNG, JPG or JPEG
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  className="hidden"
                  onChange={async (e) => {
                    setErrorMessage(null);
                    const files = e.target.files;
                    if (files == null || files.length == 0) {
                      setErrorMessage("No files wait for import.");
                      return;
                    }
                    let file = files[0];
                    let name = file.name;
                    let suffixArr = name.split("."),
                      suffix = suffixArr[suffixArr.length - 1];
                    if (
                      suffix != "png" &&
                      suffix != "jpg" &&
                      suffix != "jpeg"
                    ) {
                      setErrorMessage("Only support png jpg or jpeg files.");
                      return;
                    }
                    setLoading(true);
                    try {
                      const base64 = await convertBase64(file);
                      // Skip creating custom account on backend for now, just simulate
                      const created = { id: 'custom_' + Date.now(), fullName: name }; // Mock

                      const user = {
                        id: created.id,
                        fullName: created.fullName,
                        type: "CUSTOM",
                        picture: base64,
                        backendPictureUrl: null,
                      };

                      setCustomUser(user);
                      setSelected(user);
                    } catch (err) {
                      setErrorMessage("Failed to create custom user. Please try again.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              </label>
              {errorMessage && (
                <p className="text-red-400 text-sm mt-3 font-medium bg-red-900/20 px-4 py-2 rounded-lg">{errorMessage}</p>
              )}
            </div>
          )}
          <div className="flex justify-center w-full">
            <Link
              to="/login"
              state={{ account: selected }}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-black/90 px-10 py-4 text-xl font-bold text-white shadow-lg hover:bg-black hover:scale-105 transition-all duration-300 border border-white/10 backdrop-blur-sm"
            >
              Continue
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="ml-3 h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserSelect;
