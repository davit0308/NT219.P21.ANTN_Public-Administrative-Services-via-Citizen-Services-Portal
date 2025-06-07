


export default function Home() {

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="container px-6 py-10 mx-auto">
        <div className="lg:flex lg:items-center">
          <div className="w-full space-y-12 lg:w-1/2">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800 lg:text-3xl dark:text-white">
                Tính năng chính
              </h1>
              <div className="mt-2">
                <span className="inline-block w-40 h-1 bg-blue-500 rounded-full"></span>
                <span className="inline-block w-3 h-1 ml-1 bg-blue-500 rounded-full"></span>
                <span className="inline-block w-1 h-1 ml-1 bg-blue-500 rounded-full"></span>
              </div>
            </div>

            <div className="md:flex md:items-start md:-mx-4">
              <span className="inline-block p-2 text-blue-500 bg-blue-100 rounded-xl md:mx-4 dark:text-white dark:bg-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                </svg>
              </span>
              <div className="mt-4 md:mx-4 md:mt-0">
                <h1 className="text-xl font-semibold text-gray-700 capitalize dark:text-white">Cấp Hộ chiếu</h1>
                <p className="mt-3 text-gray-500 dark:text-gray-300">
                  Cung cấp dịch vụ đăng ký cấp mới, cấp lại và gia hạn hộ chiếu theo quy định pháp luật. Quy trình được chuẩn hóa, tích hợp chức năng tra cứu, kí số tài liệu và xác thực thông qua QR code nhanh chóng và tiện lợi.
                </p>
              </div>
            </div>

            <div className="md:flex md:items-start md:-mx-4">
              <span className="inline-block p-2 text-blue-500 bg-blue-100 rounded-xl md:mx-4 dark:text-white dark:bg-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </span>
              <div className="mt-4 md:mx-4 md:mt-0">
                <h1 className="text-xl font-semibold text-gray-700 capitalize dark:text-white">Cấp Căn cước công dân</h1>
                <p className="mt-3 text-gray-500 dark:text-gray-300">
                  Hỗ trợ công dân thực hiện thủ tục cấp mới, cấp đổi hoặc cấp lại Căn cước công dân nhanh chóng và chính xác. Quy trình được chuẩn hóa, tích hợp chức năng tra cứu, kí số tài liệu và xác thực thông qua QR code nhanh chóng và tiện lợi.
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex lg:items-center lg:w-1/2 lg:justify-center">
            <img
              className="w-[28rem] h-[28rem] object-cover xl:w-[34rem] xl:h-[34rem] rounded-full"
              src="https://media.vov.vn/sites/default/files/styles/large/public/2025-01/passport.png.jpg"
              alt=""
            />
          </div>
        </div>

        <hr className="my-12 border-gray-200 dark:border-gray-700" />
      </div>
    </section>
  );
}
