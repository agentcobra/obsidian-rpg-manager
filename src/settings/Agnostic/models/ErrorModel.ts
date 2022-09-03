import {AbstractModel} from "../../../abstracts/AbstractModel";
import {ResponseDataInterface} from "../../../interfaces/response/ResponseDataInterface";
import {ResponseData} from "../../../data/responses/ResponseData";
import {ResponseLine} from "../../../data/responses/ResponseLine";
import {ContentFactory} from "../../../factories/ContentFactory";
import {ContentType} from "../../../enums/ContentType";

export class ErrorModel extends AbstractModel {
	generateData(): ResponseDataInterface {
		const response = new ResponseData();

		const status = new ResponseLine();
		status.content =ContentFactory.create('<span class="rpgm-missing">The selected function does not exist in Rpg Manager</span>',
			ContentType.Markdown,
		);
		response.addElement(status);
		return response;
	}
}
