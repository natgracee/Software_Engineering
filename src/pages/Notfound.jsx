export const Notfound = () => {
  return (
    <div className="container min-h-screen flex items-center justify-center ">
      <h1 className="title">Oops! Page Not Found</h1>
      <p className="subtitle">
        Looks like the money fell out of this page... But don't worry, the SplitBill journey continues!
      </p>

      {[...Array(30)].map((_, i) => {
        const style = {
            left: `${Math.random() * 100}vw`,
            animationDuration: `${3 + Math.random() * 3}s`,
            animationDelay: `${Math.random() * 5}s`,
            transform: `rotateZ(${Math.random() * 360}deg)`
            };

        return <div key={i} className="bill" style={style} />;
      })}
    </div>
  );
};

