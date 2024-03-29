import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Typography,
} from "@material-ui/core";
import { TMenuComponentTranslated } from "../types";
import { Currency } from "../API";
import { useTranslation } from "react-i18next";
import { DeepMap, FieldError, useWatch } from "react-hook-form";
import { priceDisplay } from "../utils/priceDisplay";

const MenuComponent: React.FC<
  TMenuComponentTranslated & {
    currency: Currency;
    register: any;
    trigger: any;
    errors: DeepMap<Record<string, number | boolean[]>, FieldError>;
    getValues: any;
    defaultValues: boolean[];
    setfoundCompAddPrice: React.Dispatch<React.SetStateAction<Record<string, number>>>;
    control: any;
  }
> = ({
  id,
  translations,
  restrictions,
  currency,
  register,
  errors,
  getValues,
  defaultValues,
  trigger,
  setfoundCompAddPrice,
  control,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const restrictionsCheck = () => {
    const checkedLength = (getValues(
      translations.optionChoice.map((_, index) => `${id}[${index}]`)
    )[id] as boolean[]).filter((value) => value).length;
    if (restrictions?.exact && restrictions.exact !== checkedLength) {
      return false;
    } else if (restrictions?.max && restrictions.max < checkedLength) {
      return false;
    }
    return true;
  };
  const watchChoice = useWatch({
    control,
    name: id, // without supply name will watch the entire form, or ['firstName', 'lastName'] to watch both
    // defaultValue: 0, // default value before the render
  }) as boolean[];
  React.useEffect(() => {
    if (watchChoice) {
      setfoundCompAddPrice((prev) => ({
        ...prev,
        [id]: translations?.optionChoice.reduce(
          (acc, option, optionIndex) =>
            watchChoice[optionIndex] ? acc + (option.addPrice || 0) : acc,
          0
        ),
      }));
    }
  }, [watchChoice]);
  return (
    <Box className={classes.root}>
      <FormControl error={Boolean(errors[id])} component="fieldset">
        <Typography className={classes.textAligned} component="legend" variant="h6">
          {translations.label}
        </Typography>
        {restrictions?.max ? (
          <FormHelperText className={classes.textAligned}>
            {t("menu_comp_helper_max_number", { number: restrictions.max })}
          </FormHelperText>
        ) : null}
        {restrictions?.exact ? (
          <FormHelperText className={classes.textAligned}>
            {t("menu_comp_helper_exact_number", { number: restrictions.exact })}
          </FormHelperText>
        ) : null}
        {translations.optionChoice.map(({ addPrice, name }, index) => (
          <FormControlLabel
            key={name}
            classes={
              {
                // label: thisComponentState[index] ? classes.labelActive : classes.labelPassive,
              }
            }
            control={
              <Checkbox
                color="primary"
                inputRef={register(index === 0 && { validate: restrictionsCheck })}
                defaultChecked={defaultValues[index]}
                name={`${id}[${index}]`}
                onChange={() => trigger(`${id}[0]`)}
              />
            }
            label={`${name} - ${priceDisplay(currency, addPrice || 0, translations.language)}`}
          />
        ))}
      </FormControl>
    </Box>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: 15,
    },
    labelActive: {
      fontWeight: theme.typography.fontWeightBold,
    },
    labelPassive: {
      opacity: 0.5,
    },
    textAligned: { marginLeft: 27 },
  })
);

export default React.memo(MenuComponent);
